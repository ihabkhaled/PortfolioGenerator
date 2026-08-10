import { describe, expect, it } from 'vitest';

import { parseSchema } from '@/packages/zod';

import {
  paypalSaleResourceSchema,
  paypalSubscriptionResourceSchema,
  paypalWebhookEnvelopeSchema,
  paypalWebhookVerificationRequestSchema,
} from '../schemas/paypal-webhook.schema';

describe('paypalWebhookEnvelopeSchema', () => {
  it('accepts a minimal well-formed envelope', () => {
    const result = parseSchema(paypalWebhookEnvelopeSchema, {
      id: 'WH-1',
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: { id: 'I-SUB1' },
    });

    expect(result.ok).toBe(true);
  });

  it('rejects an envelope missing an event type', () => {
    expect(parseSchema(paypalWebhookEnvelopeSchema, { id: 'WH-1', resource: {} }).ok).toBe(false);
  });

  it('rejects a non-object payload', () => {
    expect(parseSchema(paypalWebhookEnvelopeSchema, 'not-an-object').ok).toBe(false);
  });
});

describe('paypalSubscriptionResourceSchema', () => {
  it('accepts a resource with only the required id', () => {
    expect(parseSchema(paypalSubscriptionResourceSchema, { id: 'I-SUB1' }).ok).toBe(true);
  });

  it('accepts custom_id and status when present', () => {
    const result = parseSchema(paypalSubscriptionResourceSchema, {
      id: 'I-SUB1',
      custom_id: 'owner-1',
      status: 'ACTIVE',
    });

    expect(result).toEqual({
      ok: true,
      value: { id: 'I-SUB1', custom_id: 'owner-1', status: 'ACTIVE' },
    });
  });

  it('rejects a resource with no id', () => {
    expect(parseSchema(paypalSubscriptionResourceSchema, { custom_id: 'owner-1' }).ok).toBe(false);
  });
});

describe('paypalSaleResourceSchema', () => {
  it('accepts a sale carrying billing_agreement_id', () => {
    expect(parseSchema(paypalSaleResourceSchema, { billing_agreement_id: 'I-SUB1' }).ok).toBe(true);
  });

  it('accepts a sale with no billing_agreement_id at all', () => {
    expect(parseSchema(paypalSaleResourceSchema, {}).ok).toBe(true);
  });
});

describe('paypalWebhookVerificationRequestSchema', () => {
  it('accepts a fully-formed verification request', () => {
    const result = parseSchema(paypalWebhookVerificationRequestSchema, {
      transmission_id: 't-1',
      transmission_time: '2026-08-10T00:00:00Z',
      cert_url: 'https://api.paypal.com/cert',
      auth_algo: 'SHA256withRSA',
      transmission_sig: 'sig',
      webhook_id: 'WH-ID',
      webhook_event: { id: 'WH-1' },
    });

    expect(result.ok).toBe(true);
  });

  it('rejects a request with a non-URL cert_url', () => {
    expect(
      parseSchema(paypalWebhookVerificationRequestSchema, {
        transmission_id: 't-1',
        transmission_time: '2026-08-10T00:00:00Z',
        cert_url: 'not-a-url',
        auth_algo: 'SHA256withRSA',
        transmission_sig: 'sig',
        webhook_id: 'WH-ID',
        webhook_event: {},
      }).ok,
    ).toBe(false);
  });
});
