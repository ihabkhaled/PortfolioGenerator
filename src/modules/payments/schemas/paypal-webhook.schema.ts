import { z } from '@/packages/zod';

/**
 * The webhook envelope, loosely typed on purpose.
 *
 * `resource` varies by `event_type` — a Subscription object for
 * `BILLING.SUBSCRIPTION.*`, a Sale object for `PAYMENT.SALE.*` — and PayPal
 * adds fields to both over time. Validating it here as `unknown` and letting
 * `mapWebhookEventToUpdate` parse the narrower shape it actually needs keeps
 * an unrelated PayPal field addition from breaking webhook processing.
 */
export const paypalWebhookEnvelopeSchema = z.object({
  id: z.string().min(1),
  event_type: z.string().min(1),
  resource: z.unknown(),
});

/** The Subscription resource carried by every `BILLING.SUBSCRIPTION.*` event. */
export const paypalSubscriptionResourceSchema = z.object({
  id: z.string().min(1),
  // Set at creation time to the owner id — see `paypal-checkout.container` —
  // so a subscription can be linked to its owner even when the browser round
  // trip through `recordApprovedSubscriptionAction` never completed.
  custom_id: z.string().min(1).optional(),
  status: z.string().optional(),
});

/** The Sale resource carried by every `PAYMENT.SALE.*` event.
 * `billing_agreement_id` is PayPal's field name for "the subscription this
 * payment belongs to". */
export const paypalSaleResourceSchema = z.object({
  billing_agreement_id: z.string().min(1).optional(),
});

/** What PayPal's verify-webhook-signature API is called with. */
export const paypalWebhookVerificationRequestSchema = z.object({
  transmission_id: z.string().min(1),
  transmission_time: z.string().min(1),
  cert_url: z.url(),
  auth_algo: z.string().min(1),
  transmission_sig: z.string().min(1),
  webhook_id: z.string().min(1),
  webhook_event: z.unknown(),
});
