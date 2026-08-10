import type { TranslateFunction } from '@/packages/i18n';
import { toAppRoute } from '@/packages/link';
import { MARKETING_ROUTE_PATHS, ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import type { SiteFooterColumn } from '../components/types/shared-component.types';

/**
 * The footer's link columns, grouped the way a visitor scans a footer: what
 * the product does, who is behind it, what governs it, and where the
 * machine-readable feeds live.
 *
 * Every href comes from `MARKETING_ROUTE_PATHS` or `ROUTE_PATHS` — the same
 * table the reserved-slug policy is built from — so a link added here can
 * never point at a page this app does not actually serve.
 */
export function buildSiteFooterLinks(translate: TranslateFunction): readonly SiteFooterColumn[] {
  return [
    {
      id: 'product',
      heading: translate('footer.columns.product'),
      links: [
        {
          id: 'features',
          href: toAppRoute(MARKETING_ROUTE_PATHS.features),
          label: translate('footer.links.features'),
        },
        {
          id: 'how-it-works',
          href: toAppRoute(MARKETING_ROUTE_PATHS['how-it-works']),
          label: translate('footer.links.howItWorks'),
        },
        {
          id: 'examples',
          href: toAppRoute(MARKETING_ROUTE_PATHS.examples),
          label: translate('footer.links.examples'),
        },
        {
          id: 'templates',
          href: toAppRoute(MARKETING_ROUTE_PATHS.templates),
          label: translate('footer.links.templates'),
        },
        {
          id: 'cv-import',
          href: toAppRoute(MARKETING_ROUTE_PATHS['cv-import']),
          label: translate('footer.links.cvImport'),
        },
        {
          id: 'ai-accuracy',
          href: toAppRoute(MARKETING_ROUTE_PATHS['ai-accuracy']),
          label: translate('footer.links.aiAccuracy'),
        },
      ],
    },
    {
      id: 'company',
      heading: translate('footer.columns.company'),
      links: [
        {
          id: 'about',
          href: toAppRoute(MARKETING_ROUTE_PATHS.about),
          label: translate('footer.links.about'),
        },
        {
          id: 'mission',
          href: toAppRoute(MARKETING_ROUTE_PATHS.mission),
          label: translate('footer.links.mission'),
        },
        {
          id: 'contact',
          href: toAppRoute(MARKETING_ROUTE_PATHS.contact),
          label: translate('footer.links.contact'),
        },
        {
          id: 'help',
          href: toAppRoute(MARKETING_ROUTE_PATHS.help),
          label: translate('footer.links.help'),
        },
      ],
    },
    {
      id: 'legal',
      heading: translate('footer.columns.legal'),
      links: [
        {
          id: 'privacy',
          href: toAppRoute(MARKETING_ROUTE_PATHS.privacy),
          label: translate('footer.links.privacy'),
        },
        {
          id: 'security',
          href: toAppRoute(MARKETING_ROUTE_PATHS.security),
          label: translate('footer.links.security'),
        },
        {
          id: 'terms',
          href: toAppRoute(MARKETING_ROUTE_PATHS.terms),
          label: translate('footer.links.terms'),
        },
        {
          id: 'accessibility',
          href: toAppRoute(MARKETING_ROUTE_PATHS.accessibility),
          label: translate('footer.links.accessibility'),
        },
      ],
    },
    {
      id: 'resources',
      heading: translate('footer.columns.resources'),
      links: [
        {
          id: 'faq',
          href: toAppRoute(MARKETING_ROUTE_PATHS.faq),
          label: translate('footer.links.faq'),
        },
        {
          id: 'changelog',
          href: toAppRoute(MARKETING_ROUTE_PATHS.changelog),
          label: translate('footer.links.changelog'),
        },
        {
          id: 'feed',
          href: ROUTE_PATHS.feed,
          label: translate('footer.links.feed'),
        },
        {
          id: 'sitemap',
          href: ROUTE_PATHS.sitemap,
          label: translate('footer.links.sitemap'),
        },
      ],
    },
  ];
}
