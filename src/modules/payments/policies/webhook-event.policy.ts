import { parseSchema } from '@/packages/zod';

import { WEBHOOK_EVENT_STATUS_BY_FAMILY } from '../constants/payments.constants';
import {
  paypalSaleResourceSchema,
  paypalSubscriptionResourceSchema,
} from '../schemas/paypal-webhook.schema';
import type { SubscriptionStatusUpdate, WebhookEventEnvelope } from '../types/payments.types';

/**
 * Pure translation from a verified PayPal event to the subscription update it
 * implies, or `null` for an event type this app does not act on.
 *
 * Two resource families, two identifiers. `BILLING.SUBSCRIPTION.*` events
 * carry a Subscription resource keyed by its own id, plus — because the
 * subscription was created client-side with `custom_id` set to the owner id
 * — a fallback identity for the case where the confirming browser round trip
 * in `recordApprovedSubscription` never happened (the tab closed mid-approval,
 * a network error on the way back). `PAYMENT.SALE.*` events carry a Sale
 * resource keyed by `billing_agreement_id`, PayPal's field name for the
 * subscription a payment belongs to; a sale never carries `custom_id`, but by
 * the time a renewal payment happens the subscription must already have been
 * linked by an earlier activation event, so no fallback is needed there.
 */
export function mapWebhookEventToUpdate(
  event: WebhookEventEnvelope,
): SubscriptionStatusUpdate | null {
  const subscriptionStatus = WEBHOOK_EVENT_STATUS_BY_FAMILY.subscription[event.event_type];

  if (subscriptionStatus !== undefined) {
    const resource = parseSchema(paypalSubscriptionResourceSchema, event.resource);

    if (!resource.ok) {
      return null;
    }

    return {
      subscriptionId: resource.value.id,
      ownerId: resource.value.custom_id ?? null,
      status: subscriptionStatus,
    };
  }

  const saleStatus = WEBHOOK_EVENT_STATUS_BY_FAMILY.sale[event.event_type];

  if (saleStatus !== undefined) {
    const resource = parseSchema(paypalSaleResourceSchema, event.resource);

    if (!resource.ok || resource.value.billing_agreement_id === undefined) {
      return null;
    }

    return {
      subscriptionId: resource.value.billing_agreement_id,
      ownerId: null,
      status: saleStatus,
    };
  }

  return null;
}
