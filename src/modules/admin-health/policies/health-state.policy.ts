import type { HealthCheck, HealthState } from '../types/health.types';

/**
 * How individual checks combine.
 *
 * The database is the only hard dependency of the public read path, so its
 * failure is `down`. Object storage is not: a published portfolio renders from
 * a JSONB column, and a bucket that is unreachable means new imports fail while
 * every existing page keeps serving. Reporting that as `down` would have an
 * orchestrator pull healthy instances out of rotation and take the site
 * offline to protect a feature nobody was using at that moment.
 */
export function combineHealth(checks: readonly HealthCheck[]): HealthState {
  if (checks.some((check) => check.name === 'database' && check.state !== 'ok')) {
    return 'down';
  }

  return checks.every((check) => check.state === 'ok') ? 'ok' : 'degraded';
}

/** `ok` and `degraded` are both serving; only `down` should fail a probe. */
export function toHttpStatus(state: HealthState): number {
  return state === 'down' ? 503 : 200;
}
