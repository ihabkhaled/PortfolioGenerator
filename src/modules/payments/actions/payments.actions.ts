'use server';

import { requireOwner } from '@/modules/auth/server';
import { logger } from '@/packages/logger';
import { parseSchema } from '@/packages/zod';

import { PAYMENTS_ERROR_KEYS } from '../constants/payments.constants';
import { subscriptionApprovalSchema } from '../schemas/subscription-approval.schema';
import { getOrCreateSubscriptionPlan } from '../services/plan.service';
import { recordApprovedSubscription } from '../services/subscription.service';
import type { PaymentsActionState } from '../types/payments.types';

/**
 * Called from the client the moment PayPal's `onApprove` fires.
 *
 * Resolves the owner from the session, never from anything the client sends
 * — a server action is a public endpoint, and a subscription id alone does
 * not prove who is submitting it. `recordApprovedSubscription` performs the
 * server-to-server check that the subscription actually belongs to this
 * owner before any billing state changes.
 */
export async function recordApprovedSubscriptionAction(
  subscriptionId: string,
): Promise<PaymentsActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(subscriptionApprovalSchema, { subscriptionId });

  if (!parsed.ok) {
    return { status: 'error', error: PAYMENTS_ERROR_KEYS.invalid };
  }

  const result = await recordApprovedSubscription(
    owner.id,
    parsed.value.subscriptionId,
    new Date(),
  );

  if (result.ok) {
    return { status: 'success', error: null };
  }

  logger.warn('payments.record_subscription_failed', { reason: result.reason });

  const errorKey =
    result.reason === 'owner-mismatch'
      ? PAYMENTS_ERROR_KEYS.ownerMismatch
      : PAYMENTS_ERROR_KEYS.unavailable;

  return { status: 'error', error: errorKey };
}

/**
 * Resolves the PayPal plan id the checkout button needs before it can
 * render, creating it (once, ever) on the first call this app makes.
 *
 * Kept behind a server action the client calls on mount, rather than inlined
 * into the settings page's own render, so a PayPal outage degrades to "the
 * button never appears" — the rest of the settings page still renders
 * instantly from the database — instead of failing the whole page.
 */
export async function getBillingPlanIdAction(): Promise<string | null> {
  await requireOwner();

  const plan = await getOrCreateSubscriptionPlan();

  return plan?.planId ?? null;
}
