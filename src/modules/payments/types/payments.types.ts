/**
 * Domain types for billing.
 *
 * `SubscriptionStatus` mirrors the Prisma enum verbatim (uppercase, same
 * members) the same way `PortfolioStatus` mirrors `portfolio_status` in the
 * portfolios module — one vocabulary from the database row to the UI, so a
 * mapper only ever narrows a string, never translates one spelling to
 * another.
 */
export type SubscriptionStatus = 'NONE' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED';

/** Billing state as the owner's account carries it — one subscription for
 * every portfolio they own. */
export interface OwnerBillingState {
  readonly trialStartedAt: Date | null;
  readonly trialEndsAt: Date | null;
  readonly subscriptionStatus: SubscriptionStatus;
  readonly paypalSubscriptionId: string | null;
}

/**
 * What the settings page and dashboard banner render, already reduced from
 * `OwnerBillingState` to the one decision the UI needs to make.
 *
 * Spelled to match the `payments.billing.status.*` message keys exactly
 * (`notStarted`, not `not-started`), so a page can build the translation key
 * as a template rather than needing a second lookup table.
 */
export type BillingStatusTag = 'notStarted' | 'trialing' | 'deactivated' | 'active';

export interface BillingStatusView {
  readonly tag: BillingStatusTag;
  /** Whole days left in the trial, floored at 0. Null when the tag does not
   * carry a countdown (`active`, `not-started`). */
  readonly daysRemaining: number | null;
}

/** The one flat product/plan this app bills against. */
export interface SubscriptionPlanRef {
  readonly productId: string;
  readonly planId: string;
}

export interface PaypalAccessToken {
  readonly accessToken: string;
  readonly expiresAt: Date;
}

/**
 * The subset of server environment this module needs to call PayPal, resolved
 * once from the raw (possibly unconfigured) server env. Every provider
 * function takes this rather than the full `ServerEnv`, so the module never
 * couples to `@/packages/env`'s internal shape beyond the four fields billing
 * actually reads.
 */
export interface PaypalClientEnv {
  readonly paypalEnv: 'sandbox' | 'live';
  readonly clientId: string;
  readonly clientSecret: string;
  readonly webhookId: string;
}

export interface PaypalWebhookHeaders {
  readonly transmissionId: string | null;
  readonly transmissionTime: string | null;
  readonly certUrl: string | null;
  readonly authAlgo: string | null;
  readonly transmissionSig: string | null;
}

/** What a verified webhook implies for one subscription. `ownerId` is only
 * ever populated from `custom_id` on a Subscription resource — see
 * `mapWebhookEventToUpdate` — and is the fallback path for linking a
 * subscription the browser round trip never confirmed. */
export interface SubscriptionStatusUpdate {
  readonly subscriptionId: string;
  readonly ownerId: string | null;
  readonly status: SubscriptionStatus;
}

export type WebhookProcessResult =
  | { readonly status: 'processed' }
  | { readonly status: 'ignored' }
  | { readonly status: 'duplicate' }
  | { readonly status: 'invalid' }
  | { readonly status: 'invalid-signature' }
  | { readonly status: 'not-configured' }
  | { readonly status: 'rate-limited' };

export interface PaymentsActionState {
  readonly status: 'idle' | 'error' | 'success';
  readonly error: string | null;
}

/**
 * The narrow slice of the PayPal JS SDK's browser-global surface this app
 * uses, typed by hand: PayPal ships no first-party types and this app does
 * not take a dependency on a community package for four methods.
 */
export interface PaypalSubscriptionCreateOptions {
  readonly plan_id: string;
  readonly custom_id: string;
}

export interface PaypalSubscriptionActions {
  readonly subscription: {
    readonly create: (options: PaypalSubscriptionCreateOptions) => Promise<string>;
  };
}

export interface PaypalApproveData {
  readonly subscriptionID?: string;
}

export interface PaypalButtonsOptions {
  readonly createSubscription: (
    data: unknown,
    actions: PaypalSubscriptionActions,
  ) => Promise<string>;
  readonly onApprove: (data: PaypalApproveData) => void;
  readonly onError?: (error: unknown) => void;
}

export interface PaypalButtonsInstance {
  readonly render: (container: HTMLElement) => Promise<void>;
}

export interface PaypalNamespace {
  readonly Buttons: (options: PaypalButtonsOptions) => PaypalButtonsInstance;
}

/** What `billing-status-banner.component.tsx` renders: props in, TSX out. */
export interface BillingStatusBannerProps {
  readonly tag: BillingStatusTag;
  readonly message: string;
}

export type CheckoutPhase =
  'loading' | 'ready' | 'unavailable' | 'submitting' | 'succeeded' | 'failed';

export interface PaypalCheckoutContainerProps {
  readonly ownerId: string;
  readonly clientId: string;
  readonly labels: {
    readonly unavailable: string;
    readonly processing: string;
    readonly succeeded: string;
    readonly failed: string;
  };
}

/** The database row `toOwnerBillingState` maps from. */
export interface BillingRow {
  readonly trialStartedAt: Date | null;
  readonly trialEndsAt: Date | null;
  readonly subscriptionStatus: string;
  readonly paypalSubscriptionId: string | null;
}

/** The shape `resolvePaypalClientEnv` needs from the server environment —
 * deliberately narrower than `ServerEnv` so this module never couples to
 * `@/packages/env` beyond the four fields billing actually reads. */
export interface PaypalRawEnv {
  readonly PAYPAL_ENV: 'sandbox' | 'live';
  readonly PAYPAL_CLIENT_ID?: string | undefined;
  readonly PAYPAL_CLIENT_SECRET?: string | undefined;
  readonly PAYPAL_WEBHOOK_ID?: string | undefined;
}

/** The generic webhook envelope shape `mapWebhookEventToUpdate` reads —
 * narrower than the full parsed envelope, so the policy does not depend on
 * the envelope's `id` field it never uses. */
export interface WebhookEventEnvelope {
  readonly event_type: string;
  readonly resource: unknown;
}

export interface PaypalRequestInit {
  readonly method: 'GET' | 'POST' | 'PATCH';
  readonly body?: unknown;
  /** Sent as `PayPal-Request-Id`; makes a POST safe to retry without creating
   * a duplicate resource, within PayPal's idempotency window. */
  readonly idempotencyKey?: string;
}

export interface PaypalVerifySignatureResponse {
  readonly verification_status: 'SUCCESS' | 'FAILURE';
}

export interface CreatePaypalProductInput {
  readonly name: string;
  readonly description: string;
  readonly idempotencyKey: string;
}

export interface CreatePaypalPlanInput {
  readonly productId: string;
  readonly name: string;
  readonly price: string;
  readonly currencyCode: string;
  readonly idempotencyKey: string;
}

export interface PaypalCreatedProduct {
  readonly productId: string;
}

export interface PaypalCreatedPlan {
  readonly planId: string;
}

export interface PaypalProductResponse {
  readonly id: string;
}

export interface PaypalPlanResponse {
  readonly id: string;
}

export interface PaypalSubscriptionResource {
  readonly id: string;
  readonly plan_id?: string;
  readonly status?: string;
  readonly custom_id?: string;
  readonly subscriber?: { readonly payer_id?: string };
}

/** A single-column row from the expired-trials sweep query. */
export interface OwnerIdRow {
  readonly id: string;
}

export type RecordApprovedSubscriptionResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: 'unavailable' | 'owner-mismatch' | 'not-found' };
