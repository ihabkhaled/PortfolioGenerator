import 'server-only';

import type { PortfolioDocument } from '@/modules/portfolio-document';
import type { PublishedPortfolio } from '@/modules/portfolios';
import { randomBytesBuffer } from '@/packages/cryptography';
import { appOrigin } from '@/packages/env';
import { getServerEnv } from '@/packages/env/server';
import { createRedisClient } from '@/packages/redis';

import {
  PORTFOLIO_PDF_CACHE_REGISTRY,
  PORTFOLIO_PDF_RENDERER_REGISTRY,
  PORTFOLIO_PDF_TOKEN_STORE_REGISTRY,
} from '../constants/portfolio-pdf-registry.constants';
import { DOWNLOAD_TOKEN_RANDOM_BYTES } from '../constants/portfolio-pdf.constants';
import {
  hasPortfolioContentChanged,
  hashPortfolioDocument,
} from '../policies/portfolio-pdf-hash.policy';
import { buildPortfolioPdfPageUrls } from '../policies/portfolio-pdf-page-url.policy';
import { isValidDownloadTokenShape } from '../policies/portfolio-pdf-token.policy';
import { createMemoryDownloadTokenStore } from '../providers/memory-download-token-store.provider';
import { createMemoryPortfolioPdfCache } from '../providers/memory-portfolio-pdf-cache.provider';
import { createPlaywrightPortfolioPdfRenderer } from '../providers/playwright-portfolio-pdf-renderer.provider';
import { createRedisDownloadTokenStore } from '../providers/redis-download-token-store.provider';
import { createRedisPortfolioPdfCache } from '../providers/redis-portfolio-pdf-cache.provider';
import type {
  PortfolioPdfCache,
  PortfolioPdfRenderer,
  PortfolioPdfTokenStore,
} from '../types/portfolio-pdf.types';

/**
 * Registry accessors, matching `rate-limit`'s `getRateLimiter` /
 * `setRateLimiter` and `storage`'s `getObjectStorage` / `setObjectStorage`:
 * lazily construct the configured implementation once, memoize it, and give
 * tests a hook to replace it.
 *
 * `REDIS_URL` unset selects the in-memory implementation — the same
 * optional-with-graceful-fallback shape as every other external integration
 * in this product (`CLAMAV_ENABLED`, `AI_PROVIDER`, …). The renderer has no
 * such split: it is always the real Chromium session, because there is
 * nothing to degrade to short of not offering the feature at all.
 */

function generateDownloadToken(): string {
  return randomBytesBuffer(DOWNLOAD_TOKEN_RANDOM_BYTES).toString('hex');
}

function createDefaultPortfolioPdfCache(): PortfolioPdfCache {
  const { REDIS_URL } = getServerEnv();

  return REDIS_URL
    ? createRedisPortfolioPdfCache(createRedisClient(REDIS_URL))
    : createMemoryPortfolioPdfCache();
}

function createDefaultPortfolioPdfTokenStore(): PortfolioPdfTokenStore {
  const { REDIS_URL } = getServerEnv();

  return REDIS_URL
    ? createRedisDownloadTokenStore(createRedisClient(REDIS_URL), generateDownloadToken)
    : createMemoryDownloadTokenStore(generateDownloadToken);
}

export function getPortfolioPdfCache(): PortfolioPdfCache {
  PORTFOLIO_PDF_CACHE_REGISTRY.value ??= createDefaultPortfolioPdfCache();

  return PORTFOLIO_PDF_CACHE_REGISTRY.value;
}

/** Test hook: swap in a fake cache, or clear it. */
export function setPortfolioPdfCache(cache: PortfolioPdfCache | null): void {
  PORTFOLIO_PDF_CACHE_REGISTRY.value = cache;
}

export function getPortfolioPdfTokenStore(): PortfolioPdfTokenStore {
  PORTFOLIO_PDF_TOKEN_STORE_REGISTRY.value ??= createDefaultPortfolioPdfTokenStore();

  return PORTFOLIO_PDF_TOKEN_STORE_REGISTRY.value;
}

/** Test hook: swap in a fake token store, or clear it. */
export function setPortfolioPdfTokenStore(store: PortfolioPdfTokenStore | null): void {
  PORTFOLIO_PDF_TOKEN_STORE_REGISTRY.value = store;
}

export function getPortfolioPdfRenderer(): PortfolioPdfRenderer {
  PORTFOLIO_PDF_RENDERER_REGISTRY.value ??= createPlaywrightPortfolioPdfRenderer();

  return PORTFOLIO_PDF_RENDERER_REGISTRY.value;
}

/** Test hook: swap in a fake renderer so a suite never launches a real browser. */
export function setPortfolioPdfRenderer(renderer: PortfolioPdfRenderer | null): void {
  PORTFOLIO_PDF_RENDERER_REGISTRY.value = renderer;
}

/**
 * The public page's footer calls this on every render. It is one or two cheap
 * lookups (a Redis `GET`, or a map read in-memory) — the expensive part,
 * actually printing the portfolio, only happens lazily on the first download
 * of a given token; minting a link costs nothing a visitor who never clicks
 * it should have to pay for.
 */
export async function getPortfolioPdfDownloadToken(
  portfolioId: string,
  now: Date,
): Promise<string | null> {
  return getPortfolioPdfTokenStore().getOrCreateToken(portfolioId, now);
}

/** The download route's first step: token to portfolio id, or null for anything it cannot vouch for. */
export async function resolvePortfolioIdFromDownloadToken(
  token: string,
  now: Date,
): Promise<string | null> {
  if (!isValidDownloadTokenShape(token)) {
    return null;
  }

  return getPortfolioPdfTokenStore().resolveToken(token, now);
}

/**
 * Cache hit, or render and cache the result.
 *
 * Synchronous, not a queue: a single portfolio's PDF is at most a few dozen
 * pages, generation is lazy (only the first download after an invalidation
 * pays for it) and the result is cached for five days — there is no backlog
 * for a queue to smooth out. See the download route for the request-duration
 * consequence of that choice.
 *
 * Returns null when the portfolio has nothing public to render; the caller
 * turns that into the same generic 404 as an unknown token.
 */
export async function getOrGeneratePortfolioPdf(
  portfolio: PublishedPortfolio,
  now: Date,
): Promise<Uint8Array | null> {
  const cache = getPortfolioPdfCache();
  const cached = await cache.get(portfolio.id, now);

  if (cached !== null) {
    return cached.bytes;
  }

  const pageUrls = buildPortfolioPdfPageUrls(appOrigin, portfolio.slug, portfolio.document);

  if (pageUrls.length === 0) {
    return null;
  }

  const bytes = await getPortfolioPdfRenderer().renderPortfolioPdf(pageUrls);

  await cache.set(portfolio.id, bytes, hashPortfolioDocument(portfolio.document), now);

  return bytes;
}

/**
 * The publish hook. Drops the cache only when the newly published content
 * actually differs from whatever produced the cached bytes — the owner's own
 * spec: republishing unchanged content keeps serving the PDF that is already
 * there.
 */
export async function invalidatePortfolioPdfCacheIfChanged(
  portfolioId: string,
  document: PortfolioDocument,
  now: Date,
): Promise<void> {
  const cache = getPortfolioPdfCache();
  const existing = await cache.getMeta(portfolioId, now);

  if (existing === null) {
    return;
  }

  if (!hasPortfolioContentChanged(existing.contentHash, hashPortfolioDocument(document))) {
    return;
  }

  await cache.delete(portfolioId);
}

/**
 * The unpublish hook. Unconditional: nothing public remains once a portfolio
 * is unpublished, so nothing stays cached either — "don't keep old file."
 */
export async function invalidatePortfolioPdfCache(portfolioId: string): Promise<void> {
  await getPortfolioPdfCache().delete(portfolioId);
}
