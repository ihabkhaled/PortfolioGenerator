import type { BillingStatusView, OwnerBillingState } from '../types/payments.types';

import { daysRemaining } from './trial.policy';

/**
 * Reduce the raw billing row to the one decision the UI renders.
 *
 * `ACTIVE` always wins regardless of trial state — a subscriber's access is
 * never gated by the trial clock, even if `trialEndsAt` is in the past from
 * before they subscribed. A `null` `trialEndsAt` means the owner has never
 * published anything yet, so there is nothing to count down: see
 * `ensureBillingTrialStarted`, which is the only place that sets it.
 */
export function describeBillingStatus(state: OwnerBillingState, now: Date): BillingStatusView {
  if (state.subscriptionStatus === 'ACTIVE') {
    return { tag: 'active', daysRemaining: null };
  }

  if (state.trialEndsAt === null) {
    return { tag: 'notStarted', daysRemaining: null };
  }

  const remaining = daysRemaining(state.trialEndsAt, now);

  if (remaining <= 0) {
    return { tag: 'deactivated', daysRemaining: 0 };
  }

  return { tag: 'trialing', daysRemaining: remaining };
}

/**
 * Second opinion for the deactivation sweep.
 *
 * The repository query that selects candidates already filters on this same
 * condition in SQL; this pure re-check is the same "re-validate at the point
 * of the effect, do not just trust the query that found the row" discipline
 * `publishPortfolio` uses for the slug and the document, applied to the row
 * that is about to be taken offline instead of the one going public.
 */
export function isEligibleForDeactivation(state: OwnerBillingState, now: Date): boolean {
  return (
    state.subscriptionStatus !== 'ACTIVE' &&
    state.trialEndsAt !== null &&
    state.trialEndsAt.getTime() <= now.getTime()
  );
}
