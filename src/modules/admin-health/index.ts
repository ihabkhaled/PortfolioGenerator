/** Public surface of the admin-health module (pure policy and types). */

export {
  HEALTH_CACHE_CONTROL,
  HEALTH_CHECK_NAMES,
  HEALTH_CHECK_TIMEOUT_MS,
  HEALTH_STATES,
} from './constants/health.constants';
export { combineHealth, toHttpStatus } from './policies/health-state.policy';
export type { HealthCheck, HealthReport, HealthState } from './types/health.types';
