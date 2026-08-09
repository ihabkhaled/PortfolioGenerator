import 'server-only';

import { headers } from 'next/headers';

import { isAppLocale } from '@/modules/localization';
import { cacheBySlug } from '@/packages/cache';

import { PORTFOLIO_CACHE_KEY_PREFIX } from '../constants/portfolio-cache.constants';
import {
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
  const load = cacheBySlug(
    async () => {
      const portfolio = await findPublishedBySlugUnscoped(slug);
      if (portfolio === null || locale === 'en') return portfolio;

      const document = await findPublishedTranslationBySlugAndLocaleUnscoped(slug, locale);
      return document === null ? null : { ...portfolio, document };
    },
    [PORTFOLIO_CACHE_KEY_PREFIX, slug, locale],
    portfolioCacheTag(slug),
  );

  return load();
}
