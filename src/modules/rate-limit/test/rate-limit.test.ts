import { describe, expect, it } from 'vitest';

import { SECONDS_PER_DAY, SECONDS_PER_HOUR } from '../constants/rate-limit.constants';
import { buildBucketKey, windowEnd, windowStart } from '../policies/rate-limit-window.policy';
import { createMemoryRateLimiter } from '../providers/memory-rate-limiter.provider';

describe('window alignment', () => {
  it('aligns a daily window to UTC midnight, so "resets tomorrow" is a date', () => {
    const start = windowStart(new Date('2026-03-14T17:42:11.000Z'), SECONDS_PER_DAY);

    expect(start.toISOString()).toBe('2026-03-14T00:00:00.000Z');
  });

  it('aligns an hourly window to the top of the hour', () => {
    const start = windowStart(new Date('2026-03-14T17:42:11.000Z'), SECONDS_PER_HOUR);

    expect(start.toISOString()).toBe('2026-03-14T17:00:00.000Z');
  });

  it('reports the end of the window as the reset time', () => {
    const end = windowEnd(new Date('2026-03-14T17:42:11.000Z'), SECONDS_PER_DAY);

    expect(end.toISOString()).toBe('2026-03-15T00:00:00.000Z');
  });

  it('puts two moments in the same window in the same bucket', () => {
    const morning = windowStart(new Date('2026-03-14T01:00:00.000Z'), SECONDS_PER_DAY);
    const evening = windowStart(new Date('2026-03-14T23:00:00.000Z'), SECONDS_PER_DAY);

    expect(morning.getTime()).toBe(evening.getTime());
  });
});

describe('buildBucketKey', () => {
  it('namespaces a subject under its limit kind', () => {
    expect(buildBucketKey('import:user', 'owner-1')).toBe('import:user:owner-1');
  });
});

describe('the in-memory limiter', () => {
  const now = new Date('2026-03-14T10:00:00.000Z');
  const request = { bucket: 'import:user:owner-1', limit: 2, windowSeconds: SECONDS_PER_DAY, now };

  it('allows calls up to the limit', async () => {
    const limiter = createMemoryRateLimiter();

    expect((await limiter.consume(request)).allowed).toBe(true);
    expect((await limiter.consume(request)).allowed).toBe(true);
  });

  it('denies the call that exceeds the limit', async () => {
    const limiter = createMemoryRateLimiter();

    await limiter.consume(request);
    await limiter.consume(request);

    expect((await limiter.consume(request)).allowed).toBe(false);
  });

  it('keeps counting past the limit, so hammering a blocked endpoint earns nothing', async () => {
    const limiter = createMemoryRateLimiter();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await limiter.consume(request);
    }

    expect((await limiter.consume(request)).used).toBe(6);
  });

  it('keeps separate subjects apart', async () => {
    const limiter = createMemoryRateLimiter();

    await limiter.consume(request);
    await limiter.consume(request);

    const other = await limiter.consume({ ...request, bucket: 'import:user:owner-2' });

    expect(other.allowed).toBe(true);
  });

  it('starts a fresh allowance in the next window', async () => {
    const limiter = createMemoryRateLimiter();

    await limiter.consume(request);
    await limiter.consume(request);

    const tomorrow = await limiter.consume({
      ...request,
      now: new Date('2026-03-15T10:00:00.000Z'),
    });

    expect(tomorrow.allowed).toBe(true);
  });

  it('reports usage without spending any of it', async () => {
    const limiter = createMemoryRateLimiter();

    await limiter.consume(request);

    expect((await limiter.peek(request)).used).toBe(1);
    expect((await limiter.peek(request)).used).toBe(1);
  });

  it('reports when the allowance resets', async () => {
    const limiter = createMemoryRateLimiter();
    const result = await limiter.consume(request);

    expect(result.resetsAt.toISOString()).toBe('2026-03-15T00:00:00.000Z');
  });
});
