import { absoluteUrl } from '@/packages/env';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { RSS_ITEM_LIMIT } from '../constants/feed.constants';
import type { FeedItem } from '../types/feed.types';
import type { SitemapPortfolio } from '../types/sitemap.types';

import { buildDefaultDescription } from './portfolio-metadata.helper';
import { pagePath } from './sitemap.helper';

export function buildPortfolioFeedItems(
  portfolios: readonly SitemapPortfolio[],
): readonly FeedItem[] {
  return portfolios
    .filter((portfolio) => portfolio.document.seo.indexable)
    .flatMap((portfolio) =>
      portfolio.document.pages
        .filter((page) => page.visible && page.visibility === 'public')
        .toSorted((left, right) => left.order - right.order)
        .map((page) => ({
          title: `${page.title} — ${portfolio.document.identity.displayName}`,
          url: absoluteUrl(pagePath(portfolio.slug, page.slug, portfolio.locale)),
          description: buildDefaultDescription(portfolio.document),
          publishedAt: portfolio.publishedAt,
        })),
    )
    .slice(0, RSS_ITEM_LIMIT);
}

export function serializeRssFeed(items: readonly FeedItem[]): string {
  const feedUrl = absoluteUrl(ROUTE_PATHS.feed);
  const entries = items
    .slice(0, RSS_ITEM_LIMIT)
    .map(
      (item) =>
        `<item><title>${escapeXml(item.title)}</title><link>${escapeXml(item.url)}</link><guid isPermaLink="true">${escapeXml(item.url)}</guid><description>${escapeXml(item.description)}</description><pubDate>${item.publishedAt.toUTCString()}</pubDate></item>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>ProFolio</title><link>${escapeXml(absoluteUrl('/'))}</link><description>Recently published portfolios</description><atom:link xmlns:atom="http://www.w3.org/2005/Atom" href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>${entries}</channel></rss>`;
}

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
