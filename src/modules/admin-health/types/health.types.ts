import type { HEALTH_STATES } from '../constants/health.constants';

export type HealthState = (typeof HEALTH_STATES)[number];

export interface HealthCheck {
  readonly name: string;
  readonly state: HealthState;
  readonly latencyMs: number;
}

/**
 * Deliberately narrow.
 *
 * No version string, no commit hash, no dependency list, no error text. This
 * endpoint is unauthenticated because a load balancer has to reach it, which
 * makes every field a public disclosure — and "which database driver is failing
 * and how" is reconnaissance, not health.
 */
export interface HealthReport {
  readonly state: HealthState;
  readonly checks: readonly HealthCheck[];
}
