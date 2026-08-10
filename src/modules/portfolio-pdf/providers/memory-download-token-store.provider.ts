import { DOWNLOAD_TOKEN_TTL_SECONDS } from '../constants/portfolio-pdf.constants';
import type { PortfolioPdfTokenStore, StoredPortfolioPdfToken } from '../types/portfolio-pdf.types';

/**
 * In-process token store: the fallback when `REDIS_URL` is unset, and what
 * the unit suite exercises directly in place of a mocked Redis client.
 *
 * Kept as two maps rather than one, matching the two Redis keys the
 * Redis-backed provider writes — the forward lookup a visitor's link uses,
 * and the reverse lookup that makes issuing a token idempotent within its
 * rotation window.
 */
export function createMemoryDownloadTokenStore(
  generateToken: () => string,
): PortfolioPdfTokenStore {
  const byToken = new Map<string, StoredPortfolioPdfToken>();
  const byPortfolio = new Map<string, StoredPortfolioPdfToken>();

  function isFresh(
    entry: StoredPortfolioPdfToken | undefined,
    now: Date,
  ): entry is StoredPortfolioPdfToken {
    return entry !== undefined && entry.expiresAt > now.getTime();
  }

  return {
    getOrCreateToken(portfolioId, now) {
      const existing = byPortfolio.get(portfolioId);

      if (isFresh(existing, now)) {
        return Promise.resolve(existing.token);
      }

      const token = generateToken();
      const entry: StoredPortfolioPdfToken = {
        token,
        portfolioId,
        expiresAt: now.getTime() + DOWNLOAD_TOKEN_TTL_SECONDS * 1000,
      };

      byToken.set(token, entry);
      byPortfolio.set(portfolioId, entry);

      return Promise.resolve(token);
    },
    resolveToken(token, now) {
      const entry = byToken.get(token);

      return Promise.resolve(isFresh(entry, now) ? entry.portfolioId : null);
    },
  };
}
