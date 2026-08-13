import 'server-only';

import { getServerEnv } from '@/packages/env/server';
import { logger } from '@/packages/logger';

import { RATE_LIMITER_REGISTRY } from '../constants/rate-limit-registry.constants';
import {
  PLATFORM_SUBJECT,
  QUOTA_BUCKETS,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
} from '../constants/rate-limit.constants';
import { buildBucketKey } from '../policies/rate-limit-window.policy';
import { createDatabaseRateLimiter } from '../providers/database-rate-limiter.provider';
import type { RateLimiter, RateLimitResult } from '../types/rate-limit.types';

/**
 * The quota policy: who may spend what, checked before anything expensive.
 *
 * Two layers, and they answer different questions. The per-user quota answers
 * "is this person using more than their share" and is the one a user can hit
 * and understand. The platform budget breaker answers "is the bill running
 * away" — it is a circuit breaker, not a product limit, and hitting it is an
 * incident rather than a user error.
 *
 * Both are consumed *before* the work, never after: a quota checked after the
 * model call has already been paid for is not a quota.
 */

export function getRateLimiter(): RateLimiter {
  RATE_LIMITER_REGISTRY.value ??= createDatabaseRateLimiter();

  return RATE_LIMITER_REGISTRY.value;
}

/** Test hook: swap in the in-memory limiter, or clear it. */
export function setRateLimiter(limiter: RateLimiter | null): void {
  RATE_LIMITER_REGISTRY.value = limiter;
}

export async function consumeResumeImportQuota(
  ownerId: string,
  now: Date,
): Promise<RateLimitResult> {
  const env = getServerEnv();

  return getRateLimiter().consume({
    bucket: buildBucketKey(QUOTA_BUCKETS.resumeImport, ownerId),
    limit: env.QUOTA_IMPORTS_PER_USER_PER_DAY,
    windowSeconds: SECONDS_PER_DAY,
    now,
  });
}

export async function releaseResumeImportQuota(ownerId: string, now: Date): Promise<void> {
  const env = getServerEnv();

  await getRateLimiter().release({
    bucket: buildBucketKey(QUOTA_BUCKETS.resumeImport, ownerId),
    limit: env.QUOTA_IMPORTS_PER_USER_PER_DAY,
    windowSeconds: SECONDS_PER_DAY,
    now,
  });
}

export async function consumeUploadIpQuota(address: string, now: Date): Promise<RateLimitResult> {
  const env = getServerEnv();

  return getRateLimiter().consume({
    bucket: buildBucketKey(QUOTA_BUCKETS.uploadIp, address),
    limit: env.QUOTA_UPLOADS_PER_IP_PER_HOUR,
    windowSeconds: SECONDS_PER_HOUR,
    now,
  });
}

export async function consumeAiOperationQuota(
  ownerId: string,
  now: Date,
): Promise<RateLimitResult> {
  const env = getServerEnv();

  return getRateLimiter().consume({
    bucket: buildBucketKey(QUOTA_BUCKETS.aiOperation, ownerId),
    limit: env.QUOTA_AI_OPERATIONS_PER_USER_PER_DAY,
    windowSeconds: SECONDS_PER_DAY,
    now,
  });
}

/**
 * The budget breaker.
 *
 * Consumes both the hourly and daily platform counters and reports whether the
 * platform is still inside its envelope. A breach is logged at error level
 * because it means either an abuse pattern or a runaway loop, and both need a
 * human.
 */
export async function consumePlatformAiBudget(now: Date): Promise<boolean> {
  const env = getServerEnv();
  const limiter = getRateLimiter();

  const hourly = await limiter.consume({
    bucket: buildBucketKey(QUOTA_BUCKETS.platformAiHourly, PLATFORM_SUBJECT),
    limit: env.BUDGET_MAX_AI_OPERATIONS_PER_HOUR,
    windowSeconds: SECONDS_PER_HOUR,
    now,
  });

  const daily = await limiter.consume({
    bucket: buildBucketKey(QUOTA_BUCKETS.platformAiDaily, PLATFORM_SUBJECT),
    limit: env.BUDGET_MAX_AI_OPERATIONS_PER_DAY,
    windowSeconds: SECONDS_PER_DAY,
    now,
  });

  if (!hourly.allowed || !daily.allowed) {
    logger.error('ai.budget.breaker_tripped', {
      hourlyUsed: hourly.used,
      hourlyLimit: hourly.limit,
      dailyUsed: daily.used,
      dailyLimit: daily.limit,
    });

    return false;
  }

  return true;
}
