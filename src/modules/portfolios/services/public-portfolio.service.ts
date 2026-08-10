import 'server-only';

import { headers } from 'next/headers';

import { isAppLocale } from '@/modules/localization';
import { cacheBySlug } from '@/packages/cache';

import { PORTFOLIO_CACHE_KEY_PREFIX } from '../constants/portfolio-cache.constants';
import {
  findPublishedByIdUnscoped,
  findPublishedBySlugUnscoped,
  findPublishedTranslationBySlugAndLocaleUnscoped,
} from '../repositories/portfolio.repository';
import type { PublishedPortfolio } from '../types/portfolio.types';

/**
 * The public read path.
 *
 * One indexed lookup, cached under a per-slug tag. No session lookup, no
 * storage call, no AI: an anonymous request costs a cache hit, and the whole
 * dependency set of this file is the database plus the framework cache.
 *
 * Publishing, unpublishing and slug changes invalidate the tag explicitly.
 * That is a correctness requirement rather than a performance one — after a
 * slug change the old address must stop serving immediately.
 */
export function portfolioCacheTag(slug: string): string {
  return `${PORTFOLIO_CACHE_KEY_PREFIX}${slug}`;
}

export async function getPublishedPortfolio(slug: string): Promise<PublishedPortfolio | null> {
  const requestHeaders = await headers();
  const requestedLocale = requestHeaders.get('x-app-locale') ?? 'en';
  const locale = isAppLocale(requestedLocale) ? requestedLocale : 'en';
  return getPublishedPortfolioForLocale(slug, locale);
}

export async function getPublishedPortfolioForLocale(
  slug: string,
  locale: string,
): Promise<PublishedPortfolio | null> {
  const safeLocale = isAppLocale(locale) ? locale : 'en';
  const load = cacheBySlug(
    async () => {
      const portfolio = await findPublishedBySlugUnscoped(slug);
      if (portfolio === null || safeLocale === 'en') return portfolio;

      const document = await findPublishedTranslationBySlugAndLocaleUnscoped(slug, safeLocale);
      return document === null ? null : { ...portfolio, document };
    },
    [PORTFOLIO_CACHE_KEY_PREFIX, slug, safeLocale],
    portfolioCacheTag(slug),
  );

  return load();
}

/**
 * The PDF download route's entry point: a token resolves to a portfolio id,
 * never a slug, so this is the by-id twin of `getPublishedPortfolio`.
 *
 * Not cache-wrapped like the slug lookup above — this only runs on a cache
 * miss in the PDF path, which already carries its own five-day cache, so a
 * second cache here would buy nothing and add a tag scheme keyed by id that
 * nothing else needs.
 */
export async function getPublishedPortfolioById(
  portfolioId: string,
): Promise<PublishedPortfolio | null> {
  return findPublishedByIdUnscoped(portfolioId);
}
