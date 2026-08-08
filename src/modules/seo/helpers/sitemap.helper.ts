import type { PortfolioDocument } from '@/modules/portfolio-document';
import { absoluteUrl } from '@/packages/env';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { SITEMAP_CHANGE_FREQUENCY } from '../constants/seo.constants';
import type { SitemapEntry, SitemapPortfolio } from '../types/sitemap.types';

/**
 * What the sitemap is allowed to contain.
 *
 * Three filters, and each one is a promise to a different person. Only
 * published portfolios: a draft is private work, and listing it in a public XML
 * file publishes it more effectively than the publish button does. Only pages
 * whose author left `indexable` on: opting out has to mean opting out
 * everywhere, not only in a meta tag a crawler may reach second. Only visible
 * pages: a hidden page returns 404, and submitting known-404s to a crawler is
 * how a domain earns a reputation for being broken.
 *
 * Marketing routes are listed separately because they belong to the platform,
 * not to a tenant, and their lifecycle is unrelated.
 */
export function buildPlatformSitemapEntries(now: Date): readonly SitemapEntry[] {
  return [
    {
      url: absoluteUrl(ROUTE_PATHS.home),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    {
      url: absoluteUrl(ROUTE_PATHS.signIn),
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: absoluteUrl(ROUTE_PATHS.signUp),
      lastModified: now,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ];
}

export function buildPortfolioSitemapEntries(
  portfolios: readonly SitemapPortfolio[],
): readonly SitemapEntry[] {
  return portfolios.flatMap((portfolio) => entriesForPortfolio(portfolio));
}

export function entriesForPortfolio(portfolio: SitemapPortfolio): readonly SitemapEntry[] {
  if (!portfolio.document.seo.indexable) {
    return [];
  }

  return portfolio.document.pages
    .filter((page) => page.visible)
    .toSorted((left, right) => left.order - right.order)
    .map((page) => ({
      url: absoluteUrl(pagePath(portfolio.slug, page.slug)),
      lastModified: portfolio.publishedAt,
      changeFrequency: SITEMAP_CHANGE_FREQUENCY,
      // The home page is the portfolio; a subpage is part of it.
      priority: page.slug === '' ? 0.8 : 0.6,
    }));
}

export function pagePath(portfolioSlug: string, pageSlug: string): string {
  return pageSlug === '' ? `/${portfolioSlug}` : `/${portfolioSlug}/${pageSlug}`;
}

/** Convenience for callers holding the whole published row. */
export function toSitemapPortfolio(
  slug: string,
  document: PortfolioDocument,
  publishedAt: Date,
): SitemapPortfolio {
  return { slug, document, publishedAt };
}
