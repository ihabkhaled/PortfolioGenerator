# ADR-0009 — PayPal subscription billing, trial scoped to the account

- **Status:** Accepted
- **Date:** 2026-08-10

## Context

A portfolio may be published and stay public for free for 10 days. After
that, the owner must be subscribed at a flat $2.50/month — no tiers — or the
portfolio is deactivated: unpublished, never deleted, until they subscribe.
Checkout is PayPal's own smart buttons, which already offer both a PayPal
account and direct card entry, so no separate card processor is introduced.

Several design questions needed a deliberate answer rather than a default:

1. Does the trial, and the subscription, belong to the portfolio or the
   account?
2. How does the app get a PayPal Product and Plan without a manual dashboard
   step, given the environment variables for PayPal are fixed by the project
   owner and none of them names a plan id?
3. How is deactivation different from — or the same as — the unpublish button
   the owner already has?
4. How does a webhook event, which only carries a PayPal subscription id, get
   attached to the right owner the first time, before this app has ever seen
   that subscription id?

## Decisions

**Billing is account-wide; the trial clock is tied to publishing.**
`User` gained `trialStartedAt`, `trialEndsAt`, `subscriptionStatus`,
`paypalSubscriptionId`, `paypalPayerId` and `subscriptionUpdatedAt`, mirroring
the existing precedent of app-specific columns on `User` (`locale`,
`themePreference`, `defaultCountryIso`). One flat subscription covers every
portfolio an owner has — "one account, many portfolios" already describes the
product, and a per-portfolio subscription would contradict it. The trial
clock is still tied to the _first publish_, not to account creation:
`ensureBillingTrialStarted` is called from `publishPortfolio` and sets
`trialStartedAt`/`trialEndsAt` exactly once, guarded by
`WHERE trial_started_at IS NULL AND subscription_status = 'NONE'` so it can
never downgrade an owner who is already `ACTIVE`. An account that never
publishes anything has nothing to be free about yet, so it never starts a
clock it does not need.

**The Product and Plan are created once, idempotently, backed by a database
row — not a manual dashboard step and not an environment variable.**
The fixed env var list has no `PAYPAL_PLAN_ID`. Rather than requiring one, or
relying on PayPal's idempotency-key replay window (which is not permanent),
`PaypalBillingPlan` is a one-row table keyed by a constant
(`PAYPAL_BILLING_PLAN_KEY = 'default'`). `getOrCreateSubscriptionPlan` reads
it first; only the very first call this app ever makes creates the Product
and Plan through the PayPal API and writes the row, with the unique
constraint on `key` resolving a create/create race the same way
`updateOwnedSlug` resolves a slug race. Every call after that is a single
indexed read. This makes "no manual setup" true for the Product/Plan without
inventing a second source of truth for its id.

**Deactivation reuses `unpublishOwnedPortfolio` exactly — the same function
the owner's own "unpublish" control calls — rather than a parallel, weaker
path.** It clears the published snapshot and sets `status = UNPUBLISHED`; the
draft is untouched, and the slug stays claimed, identically to a manual
unpublish. The asymmetry is deliberate on the way back in: subscribing does
not automatically re-publish. The owner publishes again from the editor. Two
reasons: the deactivated snapshot could be stale relative to a draft edited
in the meantime, and auto-republishing without a human action would be the
one exception to "a person reviews before anything is public" that this
product does not make even for its own automated actions.

**`custom_id` links a subscription to its owner at creation time, so a
webhook is never the _first_ place this app learns who a subscription
belongs to.** The PayPal Buttons' `createSubscription` callback sets
`custom_id` to the owner's id before the buyer ever leaves the page. Two
independent paths can then attach billing state to that owner:
`recordApprovedSubscription`, called from the client's `onApprove`, verifies
the subscription server-to-server and checks `custom_id` matches the caller
before writing anything — refusing a mismatch rather than trusting the
browser. The webhook, which is the durable system of record for every status
change afterward, resolves the row by `paypalSubscriptionId` first and falls
back to `custom_id` only if no row has been linked yet — the self-healing
path for a tab closed mid-approval, before `onApprove` ever fired.

## Consequences

- No portfolio content, draft or published, is ever deleted by billing.
  Deactivation and the owner's own unpublish button are the same operation.
- A PayPal outage degrades the checkout button to "unavailable," not a
  broken settings page: `getOrCreateSubscriptionPlan` and
  `recordApprovedSubscription` both fail soft and are called from an action
  the client hits after the page has already rendered, not from the page's
  own server-render path.
- The webhook is mandatory-to-trust, not optional: `handlePaypalWebhook`
  calls PayPal's verify-webhook-signature API before any event id or status
  is acted on, and every event id is recorded once (`PaypalWebhookEvent`,
  unique on `eventId`) so a retried delivery is a no-op rather than a second
  write.
- Re-subscribing after a cancellation, or after a payment failure resolves,
  creates a _new_ PayPal subscription (there is no PayPal-side "resume").
  That is an acceptable simplification for a flat, tier-free plan; the old
  subscription id is simply replaced by `applySubscriptionUpdate`'s
  owner-id fallback path the next time an event links a new one.

## Alternatives considered

**Per-portfolio trial and subscription.** Rejected: contradicts "one
account, many portfolios, one template," and would mean a single flat price
either double-charges an owner with two portfolios or under-charges relative
to the product's own pricing story. Nothing in the stated business rule
requires portfolios to be billed independently.

**A `PAYPAL_PLAN_ID` environment variable, filled in by a manual PayPal
dashboard step.** Considered and rejected only because it was avoidable: the
project owner's env var list is fixed and does not include one, and the
database-row approach is no less correct and needs no additional manual
step. This is recorded as a choice, not a constraint violation — the task
explicitly allowed either approach.

**Auto-republishing a deactivated portfolio the moment a subscription
activates.** Rejected: it would resurrect whatever the draft currently
contains without anyone looking at it first, which is exactly the review
step publishing exists to force.
