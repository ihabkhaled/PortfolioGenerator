import type { PortfolioDocument, PortfolioPage } from '@/modules/portfolio-document';
import { absoluteUrl } from '@/packages/env';

import { SEO_DESCRIPTION_MAX_LENGTH } from '../constants/seo.constants';
import type { PortfolioMetadataInput, PortfolioMetadataValues } from '../types/seo.types';

/**
 * Metadata derived only from reviewed, published fields.
 *
 * Nothing here infers: no guessed job title, no assembled "X | Y | Z" keyword
 * string, no fetched remote image. Everything a crawler sees is something the
 * user read in the editor and chose to publish.
 */

export function buildPageUrl(portfolioSlug: string, pageSlug: string): string {
  const path = pageSlug === '' ? `/${portfolioSlug}` : `/${portfolioSlug}/${pageSlug}`;

  return absoluteUrl(path);
}

export function buildDefaultTitle(document: PortfolioDocument, page: PortfolioPage): string {
  const base = `${document.identity.displayName} — ${document.identity.headline}`;

  return page.slug === '' ? base : `${page.title} · ${document.identity.displayName}`;
}

/**
 * The description falls back through reviewed fields rather than to a generic
 * platform sentence: a search result reading "A portfolio built with
 * PortfolioGenerate" helps nobody, least of all the person it describes.
 */
export function buildDefaultDescription(document: PortfolioDocument): string {
  const summary = document.identity.summary?.trim() ?? '';

  if (summary.length > 0) {
    return truncate(summary, SEO_DESCRIPTION_MAX_LENGTH);
  }

  return truncate(
    `${document.identity.displayName} — ${document.identity.headline}`,
    SEO_DESCRIPTION_MAX_LENGTH,
  );
}

export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trimEnd()}…`;
}

export function buildPortfolioMetadataValues(
  input: PortfolioMetadataInput,
): PortfolioMetadataValues {
  const { document, page, portfolioSlug } = input;
  const canonical = buildPageUrl(portfolioSlug, page.slug);
  const title = document.seo.title ?? buildDefaultTitle(document, page);
  const description = document.seo.description ?? buildDefaultDescription(document);

  return {
    canonical,
    title,
    description,
    // A user can opt out of indexing; the platform additionally refuses to
    // index anything that is not a published, visible page.
    indexable: document.seo.indexable && page.visible,
    imageUrl: absoluteUrl(`/${portfolioSlug}/opengraph-image`),
    displayName: document.identity.displayName,
  };
}
