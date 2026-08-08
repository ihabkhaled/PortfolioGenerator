import 'server-only';

import { getDatabase } from '@/packages/database';

import { COUNTER_RETENTION_WINDOWS } from '../constants/rate-limit.constants';
import { windowEnd, windowStart } from '../policies/rate-limit-window.policy';
import type { RateLimiter, RateLimitRequest, RateLimitResult } from '../types/rate-limit.types';

/**
 * Durable counters in Postgres.
 *
 * Not Redis. The limits that matter here are per-user-per-day import and AI
 * quotas — low-frequency writes that already sit next to a database
 * transaction. A second datastore would buy nothing and add an operational
 * dependency, a failure mode, and a bill.
 */

/**
 * Read the current count without spending any of it. Used to show a user how
 * much of their daily allowance is left, never to decide whether to proceed:
 * checking and then acting is a race, and `consume` exists so callers do not
 * have to write one.
 */
async function peekCount(input: RateLimitRequest): Promise<RateLimitResult> {
  const start = windowStart(input.now, input.windowSeconds);
  const existing = await getDatabase().rateLimitCounter.findUnique({
    where: { bucket_windowStart: { bucket: input.bucket, windowStart: start } },
    select: { count: true },
  });
  const used = existing?.count ?? 0;

  return {
    allowed: used < input.limit,
    used,
    limit: input.limit,
    resetsAt: windowEnd(input.now, input.windowSeconds),
  };
}

/**
 * Increment and decide in one statement.
 *
 * The upsert is atomic, so two concurrent requests cannot both read the same
 * count and both conclude they are under the limit. The increment happens even
 * when the answer is "denied", so hammering a blocked endpoint does not earn a
 * free retry.
 */
async function consumeCount(input: RateLimitRequest): Promise<RateLimitResult> {
  const start = windowStart(input.now, input.windowSeconds);
  const resetsAt = windowEnd(input.now, input.windowSeconds);

  const counter = await getDatabase().rateLimitCounter.upsert({
    where: { bucket_windowStart: { bucket: input.bucket, windowStart: start } },
    update: { count: { increment: 1 } },
    create: {
      bucket: input.bucket,
      windowStart: start,
      count: 1,
      expiresAt: new Date(
        resetsAt.getTime() + input.windowSeconds * 1000 * COUNTER_RETENTION_WINDOWS,
      ),
    },
    select: { count: true },
  });

  return {
    allowed: counter.count <= input.limit,
    used: counter.count,
    limit: input.limit,
    resetsAt,
  };
}

export function createDatabaseRateLimiter(): RateLimiter {
  return { consume: consumeCount, peek: peekCount };
}
