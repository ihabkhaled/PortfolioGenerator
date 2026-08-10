import { DOWNLOAD_TOKEN_PATTERN, REDIS_KEY_PREFIXES } from '../constants/portfolio-pdf.constants';

/**
 * The download token is a bearer capability, not an identifier: it is never
 * derived from the portfolio id or slug (see `generateDownloadToken` in the
 * service, which is crypto-random and nothing else), so knowing a portfolio's
 * public address gives no advantage in guessing its download link.
 */

export function isValidDownloadTokenShape(token: string): boolean {
  return DOWNLOAD_TOKEN_PATTERN.test(token);
}

/** Forward lookup: what a visitor's link actually holds. */
export function redisTokenKey(token: string): string {
  return `${REDIS_KEY_PREFIXES.tokenToPortfolio}${token}`;
}

/** Reverse lookup: lets `getOrCreateToken` be idempotent within the rotation window. */
export function redisTokenOwnerKey(portfolioId: string): string {
  return `${REDIS_KEY_PREFIXES.portfolioToToken}${portfolioId}`;
}
