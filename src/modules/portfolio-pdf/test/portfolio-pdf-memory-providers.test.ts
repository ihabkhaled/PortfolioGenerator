import { describe, expect, it } from 'vitest';

import { createMemoryDownloadTokenStore } from '../providers/memory-download-token-store.provider';
import { createMemoryPortfolioPdfCache } from '../providers/memory-portfolio-pdf-cache.provider';
import type { PortfolioPdfTokenStore } from '../types/portfolio-pdf.types';

/**
 * The memory store never actually fails to issue a token — only the
 * Redis-backed one can, when Redis itself is unreachable — so tests that need
 * a definite string rather than `string | null` assert that here instead of
 * threading a non-null assertion through every call site.
 */
async function issueToken(
  store: PortfolioPdfTokenStore,
  portfolioId: string,
  now: Date,
): Promise<string> {
  const issued = await store.getOrCreateToken(portfolioId, now);

  if (issued === null) {
    throw new Error('Expected the in-memory store to issue a token');
  }

  return issued;
}

function sequentialTokenGenerator(): () => string {
  let count = 0;

  return () => {
    count += 1;

    return `token-${count}`;
  };
}

describe('the in-memory PDF cache', () => {
  const now = new Date('2026-03-14T10:00:00.000Z');
  const bytes = new Uint8Array([1, 2, 3]);

  it('reports a miss before anything has been cached', async () => {
    const cache = createMemoryPortfolioPdfCache();

    expect(await cache.get('portfolio-1', now)).toBeNull();
    expect(await cache.getMeta('portfolio-1', now)).toBeNull();
  });

  it('returns exactly what was set, including the content hash and bytes', async () => {
    const cache = createMemoryPortfolioPdfCache();

    await cache.set('portfolio-1', bytes, 'hash-a', now);
    const entry = await cache.get('portfolio-1', now);

    expect(entry).toEqual({ bytes, contentHash: 'hash-a', generatedAt: now });
  });

  it('reports metadata without needing to read the bytes back', async () => {
    const cache = createMemoryPortfolioPdfCache();

    await cache.set('portfolio-1', bytes, 'hash-a', now);

    expect(await cache.getMeta('portfolio-1', now)).toEqual({
      contentHash: 'hash-a',
      generatedAt: now,
    });
  });

  it('keeps separate portfolios apart', async () => {
    const cache = createMemoryPortfolioPdfCache();

    await cache.set('portfolio-1', bytes, 'hash-a', now);

    expect(await cache.get('portfolio-2', now)).toBeNull();
  });

  it('expires after the five-day TTL', async () => {
    const cache = createMemoryPortfolioPdfCache();

    await cache.set('portfolio-1', bytes, 'hash-a', now);
    const fiveDaysAndOneSecondLater = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 1000);

    expect(await cache.get('portfolio-1', fiveDaysAndOneSecondLater)).toBeNull();
  });

  it('is still fresh just under the TTL', async () => {
    const cache = createMemoryPortfolioPdfCache();

    await cache.set('portfolio-1', bytes, 'hash-a', now);
    const justUnderFiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 - 1000);

    expect(await cache.get('portfolio-1', justUnderFiveDays)).not.toBeNull();
  });

  it('deletes on request, so a republish or unpublish leaves nothing behind', async () => {
    const cache = createMemoryPortfolioPdfCache();

    await cache.set('portfolio-1', bytes, 'hash-a', now);
    await cache.delete('portfolio-1');

    expect(await cache.get('portfolio-1', now)).toBeNull();
  });

  it('deleting an absent entry is a no-op success, like the object storage contract', async () => {
    const cache = createMemoryPortfolioPdfCache();

    await expect(cache.delete('never-cached')).resolves.toBeUndefined();
  });
});

describe('the in-memory download-token store', () => {
  const now = new Date('2026-03-14T10:00:00.000Z');

  it('issues a token that resolves back to the same portfolio', async () => {
    const store = createMemoryDownloadTokenStore(sequentialTokenGenerator());

    const token = await issueToken(store, 'portfolio-1', now);

    expect(await store.resolveToken(token, now)).toBe('portfolio-1');
  });

  it('is idempotent within the rotation window: the same portfolio gets the same token', async () => {
    const store = createMemoryDownloadTokenStore(sequentialTokenGenerator());

    const first = await store.getOrCreateToken('portfolio-1', now);
    const second = await store.getOrCreateToken('portfolio-1', new Date(now.getTime() + 1000));

    expect(second).toBe(first);
  });

  it('mints a new token once the previous one has rotated past its 8-hour TTL', async () => {
    const store = createMemoryDownloadTokenStore(sequentialTokenGenerator());

    const first = await store.getOrCreateToken('portfolio-1', now);
    const eightHoursAndOneSecondLater = new Date(now.getTime() + 8 * 60 * 60 * 1000 + 1000);
    const second = await store.getOrCreateToken('portfolio-1', eightHoursAndOneSecondLater);

    expect(second).not.toBe(first);
  });

  it('an old token stops resolving once it has rotated out, regardless of the new one', async () => {
    const store = createMemoryDownloadTokenStore(sequentialTokenGenerator());

    const first = await issueToken(store, 'portfolio-1', now);
    const eightHoursAndOneSecondLater = new Date(now.getTime() + 8 * 60 * 60 * 1000 + 1000);

    expect(await store.resolveToken(first, eightHoursAndOneSecondLater)).toBeNull();
  });

  it('gives two different portfolios two different tokens', async () => {
    const store = createMemoryDownloadTokenStore(sequentialTokenGenerator());

    const first = await store.getOrCreateToken('portfolio-1', now);
    const second = await store.getOrCreateToken('portfolio-2', now);

    expect(second).not.toBe(first);
  });

  it('resolves an unknown token to null rather than throwing', async () => {
    const store = createMemoryDownloadTokenStore(sequentialTokenGenerator());

    expect(await store.resolveToken('never-issued', now)).toBeNull();
  });
});
