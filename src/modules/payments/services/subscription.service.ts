import 'server-only';

import { getServerEnv } from '@/packages/env/server';
import { logger } from '@/packages/logger';

import { fromPaypalSubscriptionStatus } from '../mappers/paypal-subscription-status.mapper';
import { resolvePaypalClientEnv } from '../policies/paypal-config.policy';
import { getPaypalSubscription } from '../providers/paypal-subscriptions.provider';
import { recordOwnerSubscription } from '../repositories/billing.repository';
import type { RecordApprovedSubscriptionResult } from '../types/payments.types';

/**
 * Confirms an approved PayPal subscription server-to-server before trusting
 * it, rather than taking the browser's `onApprove` callback at face value.
 *
 * `custom_id` was set to the calling owner's id at subscription-creation time
 * (see `paypal-checkout.container`, `actions.subscription.create`). A
 * mismatch here means the subscription id being submitted does not belong to
 * the caller — someone replaying another user's id — and is refused rather
 * than silently attached to the wrong account. The webhook remains the
 * canonical, ongoing source of truth for status after this first write; this
 * call only gets the owner from "no subscription on file" to "linked".
 */
export async function recordApprovedSubscription(
  ownerId: string,
  subscriptionId: string,
  now: Date,
): Promise<RecordApprovedSubscriptionResult> {
  const paypalEnv = resolvePaypalClientEnv(getServerEnv());

  if (paypalEnv === null) {
    return { ok: false, reason: 'unavailable' };
  }

  let subscription;

  try {
    subscription = await getPaypalSubscription(paypalEnv, subscriptionId);
  } catch (error) {
    logger.warn('payments.subscription_lookup_failed', { reason: String(error) });

    return { ok: false, reason: 'unavailable' };
  }

  if (subscription.custom_id !== ownerId) {
    logger.warn('payments.subscription_owner_mismatch');

    return { ok: false, reason: 'owner-mismatch' };
  }

  const status = fromPaypalSubscriptionStatus(subscription.status ?? '');
  const saved = await recordOwnerSubscription(ownerId, subscription.id, status, now);

  return saved ? { ok: true } : { ok: false, reason: 'not-found' };
}
