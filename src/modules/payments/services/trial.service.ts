import 'server-only';

import { computeTrialEnd } from '../policies/trial.policy';
import { startOwnerTrialIfUnset } from '../repositories/billing.repository';

/**
 * Starts the owner's 10-day free trial, exactly once, the moment their first
 * portfolio goes public. Called from `publishPortfolio` on every successful
 * publish; a no-op on every call after the first — see
 * `startOwnerTrialIfUnset`.
 */
export async function ensureBillingTrialStarted(ownerId: string, now: Date): Promise<void> {
  await startOwnerTrialIfUnset(ownerId, now, computeTrialEnd(now));
}
