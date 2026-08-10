import { describe, expect, it } from 'vitest';

import { PAYPAL_WEBHOOK_EVENT_TYPES } from '../constants/payments.constants';
import { mapWebhookEventToUpdate } from '../policies/webhook-event.policy';

describe('mapWebhookEventToUpdate', () => {
  it('maps an activated subscription to ACTIVE, keyed by its own id', () => {
    expect(
      mapWebhookEventToUpdate({
        event_type: PAYPAL_WEBHOOK_EVENT_TYPES.subscriptionActivated,
        resource: { id: 'I-SUB123', custom_id: 'owner-1', status: 'ACTIVE' },
      }),
    ).toEqual({ subscriptionId: 'I-SUB123', ownerId: 'owner-1', status: 'ACTIVE' });
  });

  it('carries a null owner id when custom_id is absent, for the webhook-only linking path', () => {
    expect(
      mapWebhookEventToUpdate({
        event_type: PAYPAL_WEBHOOK_EVENT_TYPES.subscriptionActivated,
        resource: { id: 'I-SUB123' },
      }),
    ).toEqual({ subscriptionId: 'I-SUB123', ownerId: null, status: 'ACTIVE' });
  });

  it('maps every subscription lifecycle event to its status', () => {
    expect(
      mapWebhookEventToUpdate({
        event_type: PAYPAL_WEBHOOK_EVENT_TYPES.subscriptionCancelled,
        resource: { id: 'I-SUB123' },
      })?.status,
    ).toBe('CANCELED');
    expect(
      mapWebhookEventToUpdate({
        event_type: PAYPAL_WEBHOOK_EVENT_TYPES.subscriptionSuspended,
        resource: { id: 'I-SUB123' },
      })?.status,
    ).toBe('PAST_DUE');
    expect(
      mapWebhookEventToUpdate({
        event_type: PAYPAL_WEBHOOK_EVENT_TYPES.subscriptionExpired,
        resource: { id: 'I-SUB123' },
      })?.status,
    ).toBe('CANCELED');
  });

  it('maps a sale event by billing_agreement_id, never by custom_id', () => {
    expect(
      mapWebhookEventToUpdate({
        event_type: PAYPAL_WEBHOOK_EVENT_TYPES.paymentSaleCompleted,
        resource: { billing_agreement_id: 'I-SUB123' },
      }),
    ).toEqual({ subscriptionId: 'I-SUB123', ownerId: null, status: 'ACTIVE' });
    expect(
      mapWebhookEventToUpdate({
        event_type: PAYPAL_WEBHOOK_EVENT_TYPES.paymentSaleDenied,
        resource: { billing_agreement_id: 'I-SUB123' },
      })?.status,
    ).toBe('PAST_DUE');
    expect(
      mapWebhookEventToUpdate({
        event_type: PAYPAL_WEBHOOK_EVENT_TYPES.paymentSaleRefunded,
        resource: { billing_agreement_id: 'I-SUB123' },
      })?.status,
    ).toBe('PAST_DUE');
  });

  it('ignores an event type this app does not act on', () => {
    expect(
      mapWebhookEventToUpdate({ event_type: 'PAYMENT.CAPTURE.COMPLETED', resource: {} }),
    ).toBeNull();
  });

  it('ignores a subscription event whose resource does not carry an id', () => {
    expect(
      mapWebhookEventToUpdate({
        event_type: PAYPAL_WEBHOOK_EVENT_TYPES.subscriptionActivated,
        resource: { custom_id: 'owner-1' },
      }),
    ).toBeNull();
  });

  it('ignores a sale event with no billing_agreement_id', () => {
    expect(
      mapWebhookEventToUpdate({
        event_type: PAYPAL_WEBHOOK_EVENT_TYPES.paymentSaleCompleted,
        resource: { id: 'sale-1' },
      }),
    ).toBeNull();
  });

  it('ignores a resource that is not an object at all', () => {
    expect(
      mapWebhookEventToUpdate({
        event_type: PAYPAL_WEBHOOK_EVENT_TYPES.subscriptionActivated,
        resource: 'not-an-object',
      }),
    ).toBeNull();
  });
});
