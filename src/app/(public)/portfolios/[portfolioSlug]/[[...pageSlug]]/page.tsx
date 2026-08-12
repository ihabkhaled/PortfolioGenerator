import type { Metadata } from 'next';
import { headers } from 'next/headers';
import type { ReactElement } from 'react';

import { SignOutButtonContainer } from '@/modules/auth';
import { getCurrentUser } from '@/modules/auth/server';
import { DEFAULT_LOCALE, isAppLocale, localizePath } from '@/modules/localization';
import {
  buildPublicNavigation,
  findVisiblePage,
  resolvePageSlug,
} from '@/modules/portfolio-document';
import {
  buildPortfolioPdfDownloadFilename,
  hasDownloadablePortfolioContent,
} from '@/modules/portfolio-pdf';
import { PortfolioPdfDownloadLink } from '@/modules/portfolio-pdf/portfolio-pdf-ui';
import { getPortfolioPdfDownloadToken } from '@/modules/portfolio-pdf/server';
import { buildPortfolioLabels, PortfolioTemplate } from '@/modules/portfolio-renderer';
import {
  getPublishedPortfolio,
  findPublishedBySlugUnscoped,
  listPublishedTranslationsBySlugUnscoped,
} from '@/modules/portfolios/server';
import { buildThemeOptions } from '@/modules/preferences';
import { ThemeToggleContainer } from '@/modules/preferences/preferences-ui';
import { buildPrivatePageCookieName, verifyPrivatePageGrant } from '@/modules/private-page-access';
import { PrivatePageChallengeContainer } from '@/modules/private-page-access/private-page-access-ui';
import {
  buildPageUrl,
  buildPersonStructuredData,
  serializeStructuredData,
  StructuredData,
} from '@/modules/seo';
import { buildPortfolioMetadata } from '@/modules/seo/server';
import { preventResponseCaching } from '@/packages/cache';
import { getServerEnv } from '@/packages/env/server';
import { getRequestCookie } from '@/packages/headers';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { appNotFound } from '@/packages/navigation';
import { AccountMenu } from '@/shared/components/layout/account-menu.component';
import {
  buildPortfolioPdfDownloadPath,
  buildPrivatePageAssetPath,
  ROUTE_PATHS,
} from '@/shared/constants/route-paths.constants';

/**
 * Every published portfolio, at the root of the domain.
 *
 * The two dynamic segments resolve entirely against stored data: a slug is a
 * database row, and a page slug is an entry in that row's document. Nothing
 * here touches the filesystem, generates code, or knows a tenant's name at
 * build time.
 *
 * Four things must be true for a response other than 404, and they are checked
 * in this order: the portfolio exists, it is published, the requested page
 * exists, and that page is visible. A draft and a typo produce the same
 * response, so the router cannot be used to enumerate unpublished work.
 */

interface PortfolioPageProps {
  readonly params: Promise<{ portfolioSlug: string; pageSlug?: string[] }>;
  readonly searchParams: Promise<{ access?: string }>;
}

export async function generateMetadata(props: PortfolioPageProps): Promise<Metadata> {
  const { portfolioSlug, pageSlug } = await props.params;
  const resolvedPageSlug = resolvePageSlug(pageSlug);

  if (resolvedPageSlug === null) {
    return { robots: { index: false, follow: false } };
  }

  const requestHeaders = await headers();
  const requestedLocale = requestHeaders.get('x-app-locale') ?? DEFAULT_LOCALE;
  const locale = isAppLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;

  const portfolio = await getPublishedPortfolio(portfolioSlug);

  if (portfolio === null) {
    return { robots: { index: false, follow: false } };
  }

  const resolved = findVisiblePage(portfolio.document, resolvedPageSlug);

  if (resolved === null || resolved.page.visibility === 'private') {
    return { robots: { index: false, follow: false } };
  }

  const translatedSnapshots = await listPublishedTranslationsBySlugUnscoped(portfolioSlug);
  const englishPortfolio = await findPublishedBySlugUnscoped(portfolioSlug);
  const englishPage =
    englishPortfolio === null ? null : findVisiblePage(englishPortfolio.document, resolvedPageSlug);
  const availableLocales = translatedSnapshots.flatMap((translation) => {
    const translatedPage = findVisiblePage(translation.document, resolvedPageSlug);
    return translatedPage !== null && translatedPage.page.visibility === 'public'
      ? [translation.locale]
      : [];
  });

  return buildPortfolioMetadata({
    document: portfolio.document,
    page: resolved.page,
    portfolioSlug,
    locale,
    availableLocales: availableLocales.filter(isAppLocale),
    includeEnglishAlternate: englishPage !== null && englishPage.page.visibility === 'public',
  });
}

export default async function PublicPortfolioPage(
  props: PortfolioPageProps,
): Promise<ReactElement> {
  const { portfolioSlug, pageSlug } = await props.params;
  const resolvedPageSlug = resolvePageSlug(pageSlug);
  const requestHeaders = await headers();
  const requestedLocale = requestHeaders.get('x-app-locale') ?? DEFAULT_LOCALE;
  const locale = isAppLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;

  if (resolvedPageSlug === null) {
    appNotFound();
  }

  const portfolio = await getPublishedPortfolio(portfolioSlug);

  if (portfolio === null) {
    appNotFound();
  }

  const resolved = findVisiblePage(portfolio.document, resolvedPageSlug);

  if (resolved === null) {
    appNotFound();
  }

  const translate = await getServerTranslations(I18N_NAMESPACES.portfolio);

  if (resolved.page.visibility === 'private') {
    preventResponseCaching();
    const scope = {
      portfolioSlug,
      pageId: resolved.page.id,
      pageSlug: resolved.page.slug,
      locale,
    };
    const cookieName = buildPrivatePageCookieName(portfolioSlug, resolved.page.id);
    const grant = await getRequestCookie(cookieName);
    const authorized =
      grant !== null &&
      verifyPrivatePageGrant({
        grant,
        scope,
        secret: getServerEnv().BETTER_AUTH_SECRET,
      });
    if (!authorized) {
      const searchParams = await props.searchParams;

      return (
        <PrivatePageChallengeContainer
          portfolioSlug={portfolioSlug}
          pageSlug={resolved.page.slug}
          locale={locale}
          denied={searchParams.access === 'denied'}
          labels={{
            title: translate('privatePage.title'),
            description: translate('privatePage.description'),
            password: translate('privatePage.password'),
            submit: translate('privatePage.submit'),
            denied: translate('privatePage.denied'),
          }}
        />
      );
    }
  }

  const tApp = await getServerTranslations(I18N_NAMESPACES.app);
  const user = await getCurrentUser();
  const pageUrl = buildPageUrl(portfolioSlug, resolved.page.slug, locale);

  /*
   * The download link's token, not the download itself: minting or reusing it
   * is one or two cheap lookups (see `getPortfolioPdfDownloadToken`), while
   * actually printing the portfolio only happens lazily, on the first
   * download. Null when there is nothing public to download, or when the
   * token store itself is unavailable — either way, no link is better than a
   * link that always 404s.
   */
  const downloadToken = hasDownloadablePortfolioContent(portfolio.document)
    ? await getPortfolioPdfDownloadToken(portfolio.id, new Date())
    : null;

  return (
    <>
      {/*
       * Structured data on every page of the portfolio, describing the person
       * rather than the page. A crawler that lands on `/amina/projects` first
       * should learn the same thing about who this is as one that lands on the
       * home page.
       *
       * Suppressed for a page the author asked not to index: emitting
       * machine-readable claims about someone who opted out would be a strange
       * way to honour that.
       */}
      {resolved.page.visibility === 'public' && portfolio.document.seo.indexable ? (
        <StructuredData
          json={serializeStructuredData(buildPersonStructuredData(portfolio.document, pageUrl))}
        />
      ) : null}
      <PortfolioTemplate
        document={portfolio.document}
        sections={resolved.sections}
        navigation={buildPublicNavigation(portfolio.document, portfolioSlug, resolvedPageSlug).map(
          (item) => ({
            ...item,
            href: locale === DEFAULT_LOCALE ? item.href : localizePath(item.href, locale),
          }),
        )}
        labels={buildPortfolioLabels(translate)}
        portfolioSlug={portfolioSlug}
        pageTitle={resolved.page.title}
        isPreview={false}
        actions={
          <>
            <ThemeToggleContainer label={tApp('theme.label')} options={buildThemeOptions(tApp)} />
            {user === null ? null : (
              <AccountMenu
                name={user.name}
                email={user.email}
                menuLabel={tApp('nav.accountMenu')}
                dashboardHref={ROUTE_PATHS.dashboard}
                dashboardLabel={tApp('nav.dashboard')}
                preferencesHref={ROUTE_PATHS.dashboardSettings}
                preferencesLabel={tApp('nav.preferences')}
                logout={<SignOutButtonContainer />}
              />
            )}
          </>
        }
        footerLinks={
          downloadToken === null ? null : (
            <PortfolioPdfDownloadLink
              href={buildPortfolioPdfDownloadPath(downloadToken)}
              label={translate('pdf.downloadCta')}
              downloadFilename={buildPortfolioPdfDownloadFilename(portfolioSlug)}
            />
          )
        }
        {...(resolved.page.visibility === 'private'
          ? {
              buildAssetPath: (assetId: string): string => {
                const path = buildPrivatePageAssetPath(portfolioSlug, resolved.page.slug, assetId);
                return locale === DEFAULT_LOCALE ? path : localizePath(path, locale);
              },
            }
          : {})}
      />
    </>
  );
}
