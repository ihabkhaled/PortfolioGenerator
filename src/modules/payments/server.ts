import 'server-only';

/**
 * Server-only surface of the payments module.
 *
 * Separate from `index.ts` so a client component reading a billing status
 * type does not pull the database client, the PayPal HTTP client or the
 * webhook verifier into its bundle.
 */

export { getOrCreateSubscriptionPlan } from './services/plan.service';
export { ensureBillingTrialStarted } from './services/trial.service';
export { getOwnerBillingState } from './repositories/billing.repository';
export { deactivateExpiredTrialPortfolios } from './services/deactivation.service';
export { recordApprovedSubscription } from './services/subscription.service';
export { handlePaypalWebhook } from './services/webhook.service';
export {
  recordApprovedSubscriptionAction,
  getBillingPlanIdAction,
} from './actions/payments.actions';
export type { RecordApprovedSubscriptionResult } from './types/payments.types';
