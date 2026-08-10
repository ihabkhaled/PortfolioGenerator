import type { PaymentsActionState, SubscriptionStatus } from '../types/payments.types';

export const TRIAL_DURATION_DAYS = 10;
export const MS_PER_DAY = 86_400_000;

/** Owners processed per cron run, mirroring `ASSET_DELETION_BATCH_SIZE`. */
export const BILLING_DEACTIVATION_BATCH_SIZE = 50;
export const BILLING_NO_STORE_HEADERS = { 'Cache-Control': 'no-store' } as const;

/** The one row this app ever writes to `paypal_billing_plans`. There are no
 * tiers, so there is no second key. */
export const PAYPAL_BILLING_PLAN_KEY = 'default';

export const PAYPAL_API_BASE_URL = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com',
} as const;

export const PAYPAL_WEBHOOK_EVENT_TYPES = {
  subscriptionActivated: 'BILLING.SUBSCRIPTION.ACTIVATED',
  subscriptionCancelled: 'BILLING.SUBSCRIPTION.CANCELLED',
  subscriptionSuspended: 'BILLING.SUBSCRIPTION.SUSPENDED',
  subscriptionExpired: 'BILLING.SUBSCRIPTION.EXPIRED',
  paymentSaleCompleted: 'PAYMENT.SALE.COMPLETED',
  paymentSaleDenied: 'PAYMENT.SALE.DENIED',
  paymentSaleRefunded: 'PAYMENT.SALE.REFUNDED',
} as const;

/** Generous on purpose: PayPal itself retries an event that did not 2xx, and
 * this guards the endpoint against abuse, not against PayPal's own traffic. */
export const PAYMENTS_WEBHOOK_RATE_LIMIT = { max: 120, windowSeconds: 3600 } as const;
export const PAYMENTS_WEBHOOK_MAX_BODY_BYTES = 65_536;

/** HTTP status for each webhook outcome. `processed`, `ignored` and
 * `duplicate` all answer 200: PayPal retries on anything else, and none of
 * these three should ever be retried. */
export const PAYMENTS_WEBHOOK_HTTP_STATUS = {
  processed: 200,
  ignored: 200,
  duplicate: 200,
  invalid: 400,
  'invalid-signature': 400,
  'not-configured': 503,
  'rate-limited': 429,
} as const;

export const PAYMENTS_ERROR_KEYS = {
  invalid: 'errors.invalid',
  notFound: 'errors.notFound',
  unavailable: 'errors.unavailable',
  ownerMismatch: 'errors.ownerMismatch',
} as const;

export const PAYMENTS_INITIAL_ACTION_STATE: PaymentsActionState = { status: 'idle', error: null };

export const BILLING_SELECT = {
  trialStartedAt: true,
  trialEndsAt: true,
  subscriptionStatus: true,
  paypalSubscriptionId: true,
} as const;

const SUBSCRIPTION_EVENT_STATUS: Readonly<Partial<Record<string, SubscriptionStatus>>> = {
  [PAYPAL_WEBHOOK_EVENT_TYPES.subscriptionActivated]: 'ACTIVE',
  [PAYPAL_WEBHOOK_EVENT_TYPES.subscriptionCancelled]: 'CANCELED',
  [PAYPAL_WEBHOOK_EVENT_TYPES.subscriptionSuspended]: 'PAST_DUE',
  [PAYPAL_WEBHOOK_EVENT_TYPES.subscriptionExpired]: 'CANCELED',
};

const SALE_EVENT_STATUS: Readonly<Partial<Record<string, SubscriptionStatus>>> = {
  [PAYPAL_WEBHOOK_EVENT_TYPES.paymentSaleCompleted]: 'ACTIVE',
  [PAYPAL_WEBHOOK_EVENT_TYPES.paymentSaleDenied]: 'PAST_DUE',
  [PAYPAL_WEBHOOK_EVENT_TYPES.paymentSaleRefunded]: 'PAST_DUE',
};

/** Webhook-event-type-to-status lookup, keyed by resource family. Grouped
 * under one export so `webhook-event.policy.ts` reads both with a single
 * import. */
export const WEBHOOK_EVENT_STATUS_BY_FAMILY = {
  subscription: SUBSCRIPTION_EVENT_STATUS,
  sale: SALE_EVENT_STATUS,
} as const;

/**
 * PayPal's own subscription status vocabulary
 * (`APPROVAL_PENDING`/`APPROVED`/`ACTIVE`/`SUSPENDED`/`CANCELLED`/`EXPIRED`)
 * translated to this app's fixed five-value enum.
 *
 * `APPROVAL_PENDING` and `APPROVED` both map to `TRIALING` rather than a
 * dedicated "pending" state: this app bills immediately with no PayPal-side
 * trial on the plan itself, so those are transient — the
 * `BILLING.SUBSCRIPTION.ACTIVATED` webhook flips them to `ACTIVE` moments
 * later — and mapping them to `TRIALING` means access in the meantime is
 * still correctly governed by this app's own trial clock rather than
 * silently granted early.
 */
export const PAYPAL_STATUS_MAP: Readonly<Partial<Record<string, SubscriptionStatus>>> = {
  APPROVAL_PENDING: 'TRIALING',
  APPROVED: 'TRIALING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'PAST_DUE',
  CANCELLED: 'CANCELED',
  EXPIRED: 'CANCELED',
};
