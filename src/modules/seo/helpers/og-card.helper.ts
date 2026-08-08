import type { PortfolioDocument } from '@/modules/portfolio-document';
import { appOrigin } from '@/packages/env';

import { OG_HEADLINE_MAX_LENGTH, OG_NAME_MAX_LENGTH } from '../constants/og-image.constants';
import type { OgCardValues } from '../types/og-card.types';

import { truncate } from './portfolio-metadata.helper';

/**
 * The three strings the share card shows.
 *
 * Bounded here rather than in the card, because satori does not reflow past the
 * canvas — an 800-character headline does not wrap into a scrollbar, it renders
 * off the edge of a 1200×630 PNG that then appears in every share of that
 * portfolio. Truncation is the layout constraint, not a style choice.
 */
export function buildOgCardValues(document: PortfolioDocument, slug: string): OgCardValues {
  return {
    name: truncate(document.identity.displayName, OG_NAME_MAX_LENGTH),
    headline: buildCardHeadline(document),
    url: `${stripScheme(appOrigin)}/${slug}`,
  };
}

export function buildCardHeadline(document: PortfolioDocument): string | null {
  const headline = document.identity.headline?.trim() ?? '';

  return headline === '' ? null : truncate(headline, OG_HEADLINE_MAX_LENGTH);
}

/**
 * The card shows `example.com/amina`, not `https://example.com/amina`. The
 * scheme is noise at this size and costs a line of the name's width budget.
 */
export function stripScheme(origin: string): string {
  return origin.replace('https://', '').replace('http://', '');
}
