import { logger } from '@/packages/logger';
import type { RedisClient } from '@/packages/redis';

import { DOWNLOAD_TOKEN_TTL_SECONDS } from '../constants/portfolio-pdf.constants';
import { redisTokenKey, redisTokenOwnerKey } from '../policies/portfolio-pdf-token.policy';
import type { PortfolioPdfTokenStore } from '../types/portfolio-pdf.types';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error';
}

/**
 * Redis-backed token store: two keys sharing one TTL, set together every
 * time a token is minted, so they always expire together and a stale forward
 * entry can never outlive the reverse one that would otherwise keep
 * `getOrCreateToken` handing out a token nothing resolves any more.
 */
export function createRedisDownloadTokenStore(
  client: RedisClient,
  generateToken: () => string,
): PortfolioPdfTokenStore {
  return {
    async getOrCreateToken(portfolioId: string) {
      try {
        const existing = await client.get(redisTokenOwnerKey(portfolioId));

        if (existing !== null) {
          return existing;
        }

        const token = generateToken();

        await Promise.all([
          client.setWithTtl(redisTokenKey(token), portfolioId, DOWNLOAD_TOKEN_TTL_SECONDS),
          client.setWithTtl(redisTokenOwnerKey(portfolioId), token, DOWNLOAD_TOKEN_TTL_SECONDS),
        ]);

        return token;
      } catch (error) {
        logger.error('portfolio_pdf.token.issue_failed', {
          portfolioId,
          message: errorMessage(error),
        });

        return null;
      }
    },
    async resolveToken(token: string) {
      try {
        return await client.get(redisTokenKey(token));
      } catch (error) {
        logger.error('portfolio_pdf.token.resolve_failed', { message: errorMessage(error) });

        return null;
      }
    },
  };
}
