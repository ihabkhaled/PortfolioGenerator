export const HEALTH_STATES = ['ok', 'degraded', 'down'] as const;

export const HEALTH_CHECK_NAMES = {
  database: 'database',
  storage: 'storage',
  scanner: 'scanner',
} as const;

/**
 * A probe that has not answered in this long is a failure.
 *
 * A health endpoint that waits as long as a normal request defeats its own
 * purpose: the orchestrator times out first and reports "no response" instead
 * of "database down", which is the same signal with the diagnosis removed.
 */
export const HEALTH_CHECK_TIMEOUT_MS = 2000;

/** Health responses are a point-in-time answer and must never be cached. */
export const HEALTH_CACHE_CONTROL = 'no-store, max-age=0';
