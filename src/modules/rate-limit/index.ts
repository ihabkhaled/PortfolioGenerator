/** Public surface of the rate-limit module (pure policy and types). */

export {
  COUNTER_RETENTION_WINDOWS,
  PLATFORM_SUBJECT,
  QUOTA_BUCKETS,
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
} from './constants/rate-limit.constants';
export { buildBucketKey, windowEnd, windowStart } from './policies/rate-limit-window.policy';
export { createMemoryRateLimiter } from './providers/memory-rate-limiter.provider';
export type {
  QuotaKind,
  RateLimiter,
  RateLimitRequest,
  RateLimitResult,
} from './types/rate-limit.types';
