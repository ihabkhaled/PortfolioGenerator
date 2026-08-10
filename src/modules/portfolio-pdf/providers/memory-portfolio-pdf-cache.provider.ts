import { PDF_CACHE_TTL_SECONDS } from '../constants/portfolio-pdf.constants';
import type {
  PortfolioPdfCache,
  PortfolioPdfCacheEntry,
  PortfolioPdfCacheMeta,
  StoredPortfolioPdfCacheEntry,
} from '../types/portfolio-pdf.types';

/**
 * In-process cache for single-instance development, tests, and as the
 * fallback when `REDIS_URL` is unset.
 *
 * Explicitly not for production at scale: a deployment with more than one
 * instance would see every instance regenerate its own copy on the first
 * request it happens to receive, which is a correct but non-durable
 * approximation of the "always regenerate" degraded mode the product spec
 * asks for when Redis is unavailable — see `services/portfolio-pdf.service.ts`.
 */
export function createMemoryPortfolioPdfCache(): PortfolioPdfCache {
  const entries = new Map<string, StoredPortfolioPdfCacheEntry>();

  function readFresh(portfolioId: string, now: Date): StoredPortfolioPdfCacheEntry | null {
    const entry = entries.get(portfolioId);

    if (entry === undefined) {
      return null;
    }

    if (entry.expiresAt <= now.getTime()) {
      entries.delete(portfolioId);

      return null;
    }

    return entry;
  }

  return {
    get(portfolioId, now): Promise<PortfolioPdfCacheEntry | null> {
      const entry = readFresh(portfolioId, now);

      return Promise.resolve(
        entry === null
          ? null
          : { bytes: entry.bytes, contentHash: entry.contentHash, generatedAt: entry.generatedAt },
      );
    },
    getMeta(portfolioId, now): Promise<PortfolioPdfCacheMeta | null> {
      const entry = readFresh(portfolioId, now);

      return Promise.resolve(
        entry === null ? null : { contentHash: entry.contentHash, generatedAt: entry.generatedAt },
      );
    },
    set(portfolioId, bytes, contentHash, now) {
      entries.set(portfolioId, {
        bytes,
        contentHash,
        generatedAt: now,
        expiresAt: now.getTime() + PDF_CACHE_TTL_SECONDS * 1000,
      });

      return Promise.resolve();
    },
    delete(portfolioId) {
      entries.delete(portfolioId);

      return Promise.resolve();
    },
  };
}
