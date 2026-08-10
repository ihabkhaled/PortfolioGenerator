import { REDIS_KEY_PREFIXES } from '../constants/portfolio-pdf.constants';

/** Keyed by portfolio id so a slug change never orphans or leaks a cached PDF. */

export function redisCacheBytesKey(portfolioId: string): string {
  return `${REDIS_KEY_PREFIXES.cacheBytes}${portfolioId}`;
}

export function redisCacheMetaKey(portfolioId: string): string {
  return `${REDIS_KEY_PREFIXES.cacheMeta}${portfolioId}`;
}
