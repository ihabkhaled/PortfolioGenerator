import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { buildNavigation, findVisiblePage, resolvePageSlug } from '@/modules/portfolio-document';
import { buildPortfolioLabels, PortfolioTemplate } from '@/modules/portfolio-renderer';
import { getPublishedPortfolio } from '@/modules/portfolios/server';
import {
  buildPageUrl,
  buildPersonStructuredData,
  serializeStructuredData,
  StructuredData,
} from '@/modules/seo';
import { buildPortfolioMetadata } from '@/modules/seo/server';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { appNotFound } from '@/packages/navigation';

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
}

export async function generateMetadata(props: PortfolioPageProps): Promise<Metadata> {
  const { portfolioSlug, pageSlug } = await props.params;
  const resolvedPageSlug = resolvePageSlug(pageSlug);

  if (resolvedPageSlug === null) {
    return { robots: { index: false, follow: false } };
  }

  const portfolio = await getPublishedPortfolio(portfolioSlug);

  if (portfolio === null) {
    return { robots: { index: false, follow: false } };
  }

  const resolved = findVisiblePage(portfolio.document, resolvedPageSlug);

  if (resolved === null) {
    return { robots: { index: false, follow: false } };
  }

  return buildPortfolioMetadata({
    document: portfolio.document,
    page: resolved.page,
    portfolioSlug,
  });
}

export default async function PublicPortfolioPage(
  props: PortfolioPageProps,
): Promise<ReactElement> {
  const { portfolioSlug, pageSlug } = await props.params;
  const resolvedPageSlug = resolvePageSlug(pageSlug);

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
  const pageUrl = buildPageUrl(portfolioSlug, resolved.page.slug);

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
      {portfolio.document.seo.indexable ? (
        <StructuredData
          json={serializeStructuredData(buildPersonStructuredData(portfolio.document, pageUrl))}
        />
      ) : null}
      <PortfolioTemplate
        document={portfolio.document}
        sections={resolved.sections}
        navigation={buildNavigation(portfolio.document, portfolioSlug, resolvedPageSlug)}
        labels={buildPortfolioLabels(translate)}
        portfolioSlug={portfolioSlug}
        pageTitle={resolved.page.title}
        isPreview={false}
      />
    </>
  );
}
