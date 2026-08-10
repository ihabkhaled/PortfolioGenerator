import 'server-only';

import type {
  CreatePaypalPlanInput,
  CreatePaypalProductInput,
  PaypalClientEnv,
  PaypalCreatedPlan,
  PaypalCreatedProduct,
  PaypalPlanResponse,
  PaypalProductResponse,
  PaypalSubscriptionResource,
} from '../types/payments.types';

import { callPaypalApi } from './paypal-client.provider';

/**
 * The Product and Plan PayPal's Subscriptions API requires, created once and
 * reused — see `PaypalBillingPlan` in `schema.prisma`. Both requests carry the
 * same idempotency key on every call, so calling this twice in a rare
 * concurrent-first-use race is safe: PayPal returns the original resource for
 * a repeated `PayPal-Request-Id` within its idempotency window, and the
 * caller (`plan.service.ts`) additionally de-duplicates through the database
 * unique constraint on `PaypalBillingPlan.key`.
 */
export async function createPaypalProduct(
  env: PaypalClientEnv,
  input: CreatePaypalProductInput,
): Promise<PaypalCreatedProduct> {
  const product = await callPaypalApi<PaypalProductResponse>(env, '/v1/catalogs/products', {
    method: 'POST',
    idempotencyKey: input.idempotencyKey,
    body: {
      name: input.name,
      description: input.description,
      type: 'SERVICE',
      category: 'SOFTWARE',
    },
  });

  return { productId: product.id };
}

export async function createPaypalPlan(
  env: PaypalClientEnv,
  input: CreatePaypalPlanInput,
): Promise<PaypalCreatedPlan> {
  const plan = await callPaypalApi<PaypalPlanResponse>(env, '/v1/billing/plans', {
    method: 'POST',
    idempotencyKey: input.idempotencyKey,
    body: {
      product_id: input.productId,
      name: input.name,
      billing_cycles: [
        {
          frequency: { interval_unit: 'MONTH', interval_count: 1 },
          tenure_type: 'REGULAR',
          sequence: 1,
          // Zero means "no end date" — the subscription renews monthly until
          // cancelled, which is the only shape this flat, tier-free plan has.
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: input.price, currency_code: input.currencyCode },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3,
      },
    },
  });

  return { planId: plan.id };
}

/**
 * Server-to-server read used to verify a subscription id the client hands
 * back in `recordApprovedSubscription`, rather than trusting the browser's
 * claim that approval succeeded.
 */
export async function getPaypalSubscription(
  env: PaypalClientEnv,
  subscriptionId: string,
): Promise<PaypalSubscriptionResource> {
  return callPaypalApi<PaypalSubscriptionResource>(
    env,
    `/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
    { method: 'GET' },
  );
}
