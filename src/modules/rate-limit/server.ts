import 'server-only';

/** Server-only surface: the configured limiter and the quota policy. */

export { createDatabaseRateLimiter } from './providers/database-rate-limiter.provider';
export {
  consumeAiOperationQuota,
  consumePlatformAiBudget,
  consumeResumeImportQuota,
  consumeUploadIpQuota,
  getRateLimiter,
  releaseResumeImportQuota,
  setRateLimiter,
} from './services/quota.service';
