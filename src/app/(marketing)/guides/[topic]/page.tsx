import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { ContactFormContainer } from '@/modules/contact/contact-ui';
import { DEFAULT_LOCALE, isAppLocale } from '@/modules/localization';
import {
  findMarketingPage,
  MARKETING_PAGES,
  MarketingTopicPage,
  topicClasses,
} from '@/modules/marketing';
import { buildPlatformMetadataAlternates } from '@/modules/seo';
import { getRequestLocale } from '@/packages/headers';
import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';
import { AppLink, toAppRoute } from '@/packages/link';
import { appNotFound } from '@/packages/navigation';
import { MARKETING_ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

interface TopicPageProps {
  readonly params: Promise<{ topic: string }>;
}

export const dynamicParams = false;
export function generateStaticParams(): { topic: string }[] {
  return MARKETING_PAGES.map((page) => ({ topic: page.slug }));
}

export async function generateMetadata(props: TopicPageProps): Promise<Metadata> {
  const params = await props.params;
  const page = findMarketingPage(params.topic);
  if (page === null) return {};
  const t = await getServerTranslations(I18N_NAMESPACES.marketing);
  const requestedLocale = await getRequestLocale();
  const locale =
    requestedLocale !== null && isAppLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE;
  const pathname = MARKETING_ROUTE_PATHS[page.slug];

  return {
    title: t(page.titleKey),
    description: t(page.descriptionKey),
    alternates: buildPlatformMetadataAlternates(pathname, locale),
  };
}

export default async function TopicPage(props: TopicPageProps): Promise<ReactElement> {
  const params = await props.params;
  const page = findMarketingPage(params.topic);
  if (page === null) appNotFound();
  const t = await getServerTranslations(I18N_NAMESPACES.marketing);
  return (
    <>
      <MarketingTopicPage
        eyebrow={t('eyebrow')}
        title={t(page.titleKey)}
        description={t(page.descriptionKey)}
        sections={page.sections.map((key) => t(key))}
        related={page.relatedSlugs.map((slug) => {
          const related = findMarketingPage(slug);
          if (related === null) return null;
          return (
            <AppLink
              key={slug}
              href={toAppRoute(MARKETING_ROUTE_PATHS[slug])}
              className={topicClasses.relatedLink}
            >
              {t(related.titleKey)}
            </AppLink>
          );
        })}
      />
      {page.slug === 'contact' ? <ContactFormContainer /> : null}
    </>
  );
}
