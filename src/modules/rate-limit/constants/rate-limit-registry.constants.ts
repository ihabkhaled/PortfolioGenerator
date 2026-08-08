import type { RateLimiter } from '../types/rate-limit.types';

/**
 * The process-wide slot holding the configured rate limiter.
 *
 * Exposed as a holder so a test can swap in the in-memory limiter without the
 * quota policy knowing, and so there is one greppable answer to "what is
 * caching a limiter here".
 */
export const RATE_LIMITER_REGISTRY: { value: RateLimiter | null } = { value: null };
