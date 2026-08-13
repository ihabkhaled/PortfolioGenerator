import { buildBucketKey, windowEnd, windowStart } from '../policies/rate-limit-window.policy';
import type { RateLimiter, RateLimitRequest, RateLimitResult } from '../types/rate-limit.types';

/**
 * In-process counters for tests and single-instance development.
 *
 * Explicitly not for production: a second instance would double every user's
 * quota, and the production adapter is the Postgres one for exactly that
 * reason. Kept because a test suite that hits the database to assert a limit
 * is a slow test suite.
 */
export function createMemoryRateLimiter(): RateLimiter {
  const counters = new Map<string, number>();

  function evaluate(input: RateLimitRequest, increment: boolean): RateLimitResult {
    const start = windowStart(input.now, input.windowSeconds);
    const key = buildBucketKey(input.bucket, start.toISOString());
    const current = counters.get(key) ?? 0;
    const used = increment ? current + 1 : current;

    if (increment) {
      counters.set(key, used);
    }

    return {
      allowed: used <= input.limit,
      used,
      limit: input.limit,
      resetsAt: windowEnd(input.now, input.windowSeconds),
    };
  }

  return {
    consume(input) {
      return Promise.resolve(evaluate(input, true));
    },
    release(input) {
      const start = windowStart(input.now, input.windowSeconds);
      const key = buildBucketKey(input.bucket, start.toISOString());
      counters.set(key, Math.max(0, (counters.get(key) ?? 0) - 1));
      return Promise.resolve();
    },
    peek(input) {
      return Promise.resolve(evaluate(input, false));
    },
  };
}
