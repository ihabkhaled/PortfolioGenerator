import type { BillingRow, OwnerBillingState, SubscriptionStatus } from '../types/payments.types';

/** Database row to domain object, the same one-place-trusted-data pattern as
 * `toOwnedPortfolio` in the portfolios module. */
export function toOwnerBillingState(row: BillingRow): OwnerBillingState {
  return {
    trialStartedAt: row.trialStartedAt,
    trialEndsAt: row.trialEndsAt,
    subscriptionStatus: row.subscriptionStatus as SubscriptionStatus,
    paypalSubscriptionId: row.paypalSubscriptionId,
  };
}
