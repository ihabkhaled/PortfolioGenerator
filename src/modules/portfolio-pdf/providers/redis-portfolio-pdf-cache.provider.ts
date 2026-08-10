import { logger } from '@/packages/logger';
import type { RedisClient } from '@/packages/redis';

import { PDF_CACHE_TTL_SECONDS } from '../constants/portfolio-pdf.constants';
import { redisCacheBytesKey, redisCacheMetaKey } from '../policies/portfolio-pdf-cache-key.policy';
import type {
  PortfolioPdfCache,
  PortfolioPdfCacheMeta,
  RedisPortfolioPdfCacheMeta,
} from '../types/portfolio-pdf.types';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

function parseMeta(raw: string | null): PortfolioPdfCacheMeta | null {
  if (raw === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('contentHash' in parsed) ||
      !('generatedAt' in parsed) ||
      typeof parsed.contentHash !== 'string' ||
      typeof parsed.generatedAt !== 'string'
    ) {
      return null;
    }

    const generatedAt = new Date(parsed.generatedAt);

    return Number.isNaN(generatedAt.getTime())
      ? null
      : { contentHash: parsed.contentHash, generatedAt };
  } catch {
    return null;
  }
}

/**
 * Redis-backed cache: the production implementation, shared across every
 * instance a deployment runs.
 *
 * Every operation is defensive. This cache sits behind the public portfolio
 * page's footer link (`getOrCreateToken`, via the token store next to this
 * file) as well as the download route, and a published portfolio has to keep
 * rendering when Redis is unreachable — the same guarantee the product
 * already makes for the database being the only hard dependency. A read or
 * write failure here is logged and treated as a cache miss, never thrown.
 */
export function createRedisPortfolioPdfCache(client: RedisClient): PortfolioPdfCache {
  return {
    async get(portfolioId) {
      try {
        const [bytes, metaRaw] = await Promise.all([
          client.getBuffer(redisCacheBytesKey(portfolioId)),
          client.get(redisCacheMetaKey(portfolioId)),
        ]);
        const meta = parseMeta(metaRaw);

        return bytes === null || meta === null ? null : { bytes, ...meta };
      } catch (error) {
        logger.error('portfolio_pdf.cache.get_failed', {
          portfolioId,
          message: errorMessage(error),
        });

        return null;
      }
    },
    async getMeta(portfolioId) {
      try {
        return parseMeta(await client.get(redisCacheMetaKey(portfolioId)));
      } catch (error) {
        logger.error('portfolio_pdf.cache.get_meta_failed', {
          portfolioId,
          message: errorMessage(error),
        });

        return null;
      }
    },
    async set(portfolioId, bytes, contentHash, now) {
      try {
        const meta: RedisPortfolioPdfCacheMeta = { contentHash, generatedAt: now.toISOString() };

        await Promise.all([
          client.setWithTtl(
            redisCacheBytesKey(portfolioId),
            Buffer.from(bytes),
            PDF_CACHE_TTL_SECONDS,
          ),
          client.setWithTtl(
            redisCacheMetaKey(portfolioId),
            JSON.stringify(meta),
            PDF_CACHE_TTL_SECONDS,
          ),
        ]);
      } catch (error) {
        // The caller already has the freshly rendered bytes in hand and will
        // serve them regardless — a failed write only means the *next*
        // request regenerates too, not that this one fails.
        logger.error('portfolio_pdf.cache.set_failed', {
          portfolioId,
          message: errorMessage(error),
        });
      }
    },
    async delete(portfolioId) {
      try {
        await client.delete(redisCacheBytesKey(portfolioId), redisCacheMetaKey(portfolioId));
      } catch (error) {
        logger.error('portfolio_pdf.cache.delete_failed', {
          portfolioId,
          message: errorMessage(error),
        });
      }
    },
  };
}
