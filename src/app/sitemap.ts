import type { MetadataRoute } from 'next';

import { listPublishedPortfoliosUnscoped } from '@/modules/portfolios/server';
import { buildPlatformSitemapEntries, buildPortfolioSitemapEntries } from '@/modules/seo';

/**
 * One sitemap for the platform and every published portfolio.
 *
 * A single file rather than a per-tenant index: at this scale the whole list is
 * one indexed query, and an index that fans out to thousands of tiny sitemaps
 * costs crawlers more requests than it saves anyone.
 *
 * Dynamic rather than build-time. A portfolio published five minutes ago should
 * appear here; a static sitemap generated at deploy would describe whichever
 * tenants existed when the build ran, which is exactly the set that does not
 * matter.
 */
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const portfolios = await listPublishedPortfoliosUnscoped();
  const generatedAt = new Date();

  return [
    ...buildPlatformSitemapEntries(generatedAt),
    ...buildPortfolioSitemapEntries(
      portfolios.map((portfolio) => ({
        slug: portfolio.slug,
        document: portfolio.document,
        publishedAt: portfolio.publishedAt,
      })),
    ),
  ].map((entry) => ({ ...entry }));
}
