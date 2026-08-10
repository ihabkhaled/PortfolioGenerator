import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { HOME_PAGE_SLUG } from '../constants/portfolio-document.constants';
import type {
  PortfolioDocument,
  PortfolioNavigationItem,
  PortfolioPage,
  PortfolioSection,
  ResolvedPortfolioPage,
} from '../types/portfolio-document.types';

/**
 * Route resolution for the public renderer.
 *
 * A URL segment reaches this file straight from the network, so every lookup
 * is an exact match against stored data. There is no normalization, no
 * case-folding and no "did you mean" fallback: a request that does not match a
 * visible page is a 404, which is also what keeps a hidden page from being
 * discovered by guessing near-misses of its slug.
 */

export function resolvePageSlug(segments: readonly string[] | undefined): string | null {
  if (!segments || segments.length === 0) {
    return HOME_PAGE_SLUG;
  }

  if (segments.length > 1) {
    return null;
  }

  /* v8 ignore next -- length is 0 or 1 here, and 0 returned above. */
  return segments[0] ?? null;
}

export function findVisiblePage(
  document: PortfolioDocument,
  pageSlug: string,
): ResolvedPortfolioPage | null {
  const page = document.pages.find((candidate) => candidate.slug === pageSlug);

  if (!page?.visible) {
    return null;
  }

  return { page, sections: sortVisibleSections(page.sections) };
}

export function findPublicPage(
  document: PortfolioDocument,
  pageSlug: string,
): ResolvedPortfolioPage | null {
  const resolved = findVisiblePage(document, pageSlug);

  return resolved?.page.visibility === 'public' ? resolved : null;
}

export function sortVisibleSections(
  sections: readonly PortfolioSection[],
): readonly PortfolioSection[] {
  return sections
    .filter((section) => section.visible)
    .toSorted((left, right) => left.order - right.order);
}

export function sortVisiblePages(document: PortfolioDocument): readonly PortfolioPage[] {
  return document.pages
    .filter((page) => page.visible)
    .toSorted((left, right) => left.order - right.order);
}

export function buildPageHref(portfolioSlug: string, pageSlug: string): string {
  const portfolioPath = `${ROUTE_PATHS.portfolios}/${portfolioSlug}`;

  return pageSlug === HOME_PAGE_SLUG ? portfolioPath : `${portfolioPath}/${pageSlug}`;
}

export function buildNavigation(
  document: PortfolioDocument,
  portfolioSlug: string,
  currentPageSlug: string,
): readonly PortfolioNavigationItem[] {
  return sortVisiblePages(document).map((page) => ({
    pageId: page.id,
    slug: page.slug,
    label: page.navLabel,
    href: buildPageHref(portfolioSlug, page.slug),
    isCurrent: page.slug === currentPageSlug,
    isHome: page.slug === HOME_PAGE_SLUG,
  }));
}

export function buildPublicNavigation(
  document: PortfolioDocument,
  portfolioSlug: string,
  currentPageSlug: string,
): readonly PortfolioNavigationItem[] {
  const publicDocument = {
    ...document,
    pages: document.pages.filter((page) => page.visibility === 'public'),
  };

  return buildNavigation(publicDocument, portfolioSlug, currentPageSlug);
}
