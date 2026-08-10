import {
  buildPageHref,
  sortVisiblePages,
  type PortfolioDocument,
} from '@/modules/portfolio-document';

/**
 * The PDF is built by printing the real public page for each visible, public
 * page of the portfolio, in the portfolio's own navigation order — the same
 * filter `buildPublicNavigation` applies, so a private page is never even
 * requested, let alone rendered into the file.
 */
export function buildPortfolioPdfPageUrls(
  baseUrl: string,
  portfolioSlug: string,
  document: PortfolioDocument,
): readonly string[] {
  return sortVisiblePages(document)
    .filter((page) => page.visibility === 'public')
    .map((page) => `${baseUrl}${buildPageHref(portfolioSlug, page.slug)}`);
}

/** Whether there is anything a visitor could download at all. */
export function hasDownloadablePortfolioContent(document: PortfolioDocument): boolean {
  return sortVisiblePages(document).some((page) => page.visibility === 'public');
}

export function buildPortfolioPdfDownloadFilename(portfolioSlug: string): string {
  return `${portfolioSlug}.pdf`;
}
