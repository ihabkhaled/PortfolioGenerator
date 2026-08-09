import type { PortfolioDocument } from '@/modules/portfolio-document';

/**
 * Mirrors the shape `next/sitemap` accepts, declared here rather than imported
 * so the pure builder — and its unit test — do not depend on the framework.
 */
export interface SitemapEntry {
  readonly url: string;
  readonly lastModified: Date;
  readonly changeFrequency:
    'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  readonly priority: number;
}

export interface SitemapPortfolio {
  readonly slug: string;
  readonly document: PortfolioDocument;
  readonly publishedAt: Date;
  readonly locale?: string;
}
