import 'server-only';

import { cacheBySlug } from '@/packages/cache';

import { PORTFOLIO_CACHE_KEY_PREFIX } from '../constants/portfolio-cache.constants';
import { findPublishedBySlugUnscoped } from '../repositories/portfolio.repository';
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
  const load = cacheBySlug(
    () => findPublishedBySlugUnscoped(slug),
    [PORTFOLIO_CACHE_KEY_PREFIX, slug],
    portfolioCacheTag(slug),
  );

  return load();
}
