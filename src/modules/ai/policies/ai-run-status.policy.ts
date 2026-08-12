import type { AiErrorCode } from '../types/ai-provider.types';
import type { AiRunStatus } from '../types/ai-run.types';

/**
 * Map a provider failure to the status recorded on the run.
 *
 * The distinction is operational, not cosmetic. A spike in `FAILED_VALIDATION`
 * means the model is drifting and the prompt or schema needs work; a spike in
 * `FAILED_PROVIDER` means someone else's outage. Collapsing them into one
 * "failed" would make the dashboard unable to tell those apart at exactly the
 * moment someone needs to.
 */
export function toAiRunStatus(errorCode: AiErrorCode): AiRunStatus {
  switch (errorCode) {
    case 'invalid-output': {
      return 'FAILED_VALIDATION';
    }

    case 'timeout': {
      return 'FAILED_TIMEOUT';
    }

    case 'provider-error':
    case 'quota-exceeded':
    case 'not-configured': {
      return 'FAILED_PROVIDER';
    }
  }
}

/**
 * Whether a failure is worth another attempt.
 *
 * A misconfigured provider will not fix itself between two calls a second
 * apart, so retrying it just doubles the latency before the user sees the same
 * error. The other two can genuinely differ on a second attempt — a stronger
 * model, or a transient network fault.
 */
export function isRetryable(errorCode: AiErrorCode): boolean {
  return errorCode !== 'not-configured' && errorCode !== 'quota-exceeded';
}

/** Whether the next attempt should escalate to the stronger, costlier model. */
export function shouldEscalate(errorCode: AiErrorCode, attempt: number): boolean {
  return errorCode === 'invalid-output' && attempt >= 1;
}
