import 'server-only';

import { getServerEnv } from '@/packages/env/server';
import { logger } from '@/packages/logger';

import { PAYPAL_BILLING_PLAN_KEY } from '../constants/payments.constants';
import { resolvePaypalClientEnv } from '../policies/paypal-config.policy';
import { createPaypalPlan, createPaypalProduct } from '../providers/paypal-subscriptions.provider';
import { findPaypalBillingPlan, savePaypalBillingPlan } from '../repositories/billing.repository';
import type { SubscriptionPlanRef } from '../types/payments.types';

/**
 * The one Product/Plan this app bills against, created idempotently the first
 * time it is needed rather than requiring a manual PayPal-dashboard setup
 * step. There are no tiers, so there is exactly one of each.
 *
 * The database row (`PaypalBillingPlan`, keyed by `PAYPAL_BILLING_PLAN_KEY`)
 * is the real idempotency guard — `savePaypalBillingPlan` resolves a
 * create-create race through its unique constraint — so after the first
 * successful call this is a single indexed read, not a PayPal round trip on
 * every settings-page render.
 *
 * Returns `null` when PayPal is not configured or plan creation fails, so a
 * page calling this can hide the checkout button rather than failing the
 * whole render because PayPal happened to be unreachable.
 */
export async function getOrCreateSubscriptionPlan(): Promise<SubscriptionPlanRef | null> {
  const env = getServerEnv();
  const paypalEnv = resolvePaypalClientEnv(env);

  if (paypalEnv === null) {
    return null;
  }

  const existing = await findPaypalBillingPlan(PAYPAL_BILLING_PLAN_KEY);

  if (existing !== null) {
    return existing;
  }

  try {
    const product = await createPaypalProduct(paypalEnv, {
      name: 'ProFolio subscription',
      description: 'Keeps a published ProFolio portfolio public after its free trial.',
      idempotencyKey: `profolio-product-${PAYPAL_BILLING_PLAN_KEY}`,
    });
    const plan = await createPaypalPlan(paypalEnv, {
      productId: product.productId,
      name: 'ProFolio monthly',
      price: env.PAYMENT_PRICE,
      currencyCode: 'USD',
      idempotencyKey: `profolio-plan-${PAYPAL_BILLING_PLAN_KEY}`,
    });

    return await savePaypalBillingPlan(PAYPAL_BILLING_PLAN_KEY, {
      productId: product.productId,
      planId: plan.planId,
    });
  } catch (error) {
    logger.error('payments.plan_setup_failed', { reason: String(error) });

    return null;
  }
}
