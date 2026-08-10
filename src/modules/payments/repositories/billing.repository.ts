import 'server-only';

import { getDatabase } from '@/packages/database';

import { BILLING_SELECT } from '../constants/payments.constants';
import { toOwnerBillingState } from '../mappers/billing-state.mapper';
import type {
  OwnerBillingState,
  OwnerIdRow,
  SubscriptionPlanRef,
  SubscriptionStatus,
  SubscriptionStatusUpdate,
} from '../types/payments.types';

export async function getOwnerBillingState(ownerId: string): Promise<OwnerBillingState | null> {
  const row = await getDatabase().user.findFirst({
    where: { id: ownerId },
    select: BILLING_SELECT,
  });

  return row === null ? null : toOwnerBillingState(row);
}

/**
 * Start the trial exactly once, the moment an owner's first portfolio goes
 * public.
 *
 * The `where` clause carries both `trialStartedAt: null` and
 * `subscriptionStatus: 'NONE'`, so this is a no-op — not a downgrade — for an
 * owner who somehow already has a subscription before ever publishing: their
 * access was never going to be gated by a trial clock anyway, and this way
 * the update can never overwrite `ACTIVE` with `TRIALING`.
 */
export async function startOwnerTrialIfUnset(
  ownerId: string,
  startedAt: Date,
  endsAt: Date,
): Promise<boolean> {
  const updated = await getDatabase().user.updateMany({
    where: { id: ownerId, trialStartedAt: null, subscriptionStatus: 'NONE' },
    data: { trialStartedAt: startedAt, trialEndsAt: endsAt, subscriptionStatus: 'TRIALING' },
  });

  return updated.count > 0;
}

/**
 * Owner-scoped write for the confirmed-by-server-lookup path: the settings
 * page action, after `getPaypalSubscription` has verified the subscription
 * really belongs to this owner.
 */
export async function recordOwnerSubscription(
  ownerId: string,
  subscriptionId: string,
  status: SubscriptionStatus,
  now: Date,
): Promise<boolean> {
  const updated = await getDatabase().user.updateMany({
    where: { id: ownerId },
    data: {
      paypalSubscriptionId: subscriptionId,
      subscriptionStatus: status,
      subscriptionUpdatedAt: now,
    },
  });

  return updated.count > 0;
}

/**
 * Webhook-driven write. Tries the subscription id first — the durable link
 * once it exists — and falls back to the owner id carried as `custom_id` only
 * when no row has been linked to this subscription yet, self-healing the case
 * where the browser round trip never confirmed it.
 */
export async function applySubscriptionUpdate(
  update: SubscriptionStatusUpdate,
  now: Date,
): Promise<boolean> {
  const bySubscription = await getDatabase().user.updateMany({
    where: { paypalSubscriptionId: update.subscriptionId },
    data: { subscriptionStatus: update.status, subscriptionUpdatedAt: now },
  });

  if (bySubscription.count > 0) {
    return true;
  }

  if (update.ownerId === null) {
    return false;
  }

  const byOwner = await getDatabase().user.updateMany({
    where: { id: update.ownerId },
    data: {
      paypalSubscriptionId: update.subscriptionId,
      subscriptionStatus: update.status,
      subscriptionUpdatedAt: now,
    },
  });

  return byOwner.count > 0;
}

/**
 * Delivery-id dedupe. Returns `true` for a genuinely new event (and records
 * it in the same statement); `false` when this event id has already been
 * processed, which the caller treats as an idempotent success rather than
 * reapplying the update.
 */
export async function recordWebhookEventIfNew(
  eventId: string,
  eventType: string,
  now: Date,
): Promise<boolean> {
  try {
    await getDatabase().paypalWebhookEvent.create({
      data: { eventId, eventType, processedAt: now },
    });

    return true;
  } catch {
    // The unique index on `eventId` is the authority on "already seen" — a
    // race between two concurrent deliveries of the same event resolves to
    // exactly one of them returning `true`.
    return false;
  }
}

/** Owners whose trial has ended without an active subscription — every
 * non-`ACTIVE` status is eligible, `PAST_DUE` and `CANCELED` included. */
export async function findOwnersWithExpiredTrials(
  now: Date,
  limit: number,
): Promise<readonly OwnerIdRow[]> {
  return getDatabase().user.findMany({
    where: { trialEndsAt: { lt: now }, subscriptionStatus: { not: 'ACTIVE' } },
    select: { id: true },
    take: limit,
  });
}

export async function findPaypalBillingPlan(key: string): Promise<SubscriptionPlanRef | null> {
  const row = await getDatabase().paypalBillingPlan.findUnique({
    where: { key },
    select: { productId: true, planId: true },
  });

  return row === null ? null : { productId: row.productId, planId: row.planId };
}

/**
 * Race-safe first write. Two requests racing to create the plan on a cold
 * deploy both attempt the insert; the loser's unique-constraint violation is
 * caught and it reads back the winner's row instead of erroring the page that
 * triggered it.
 */
export async function savePaypalBillingPlan(
  key: string,
  ref: SubscriptionPlanRef,
): Promise<SubscriptionPlanRef> {
  try {
    const row = await getDatabase().paypalBillingPlan.create({
      data: { key, productId: ref.productId, planId: ref.planId },
      select: { productId: true, planId: true },
    });

    return { productId: row.productId, planId: row.planId };
  } catch {
    const existing = await findPaypalBillingPlan(key);

    return existing ?? ref;
  }
}
