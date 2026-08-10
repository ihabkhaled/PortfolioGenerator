import { describe, expect, it } from 'vitest';

import { resolvePaypalClientEnv } from '../policies/paypal-config.policy';

describe('resolvePaypalClientEnv', () => {
  it('returns null when any required value is missing', () => {
    expect(resolvePaypalClientEnv({ PAYPAL_ENV: 'sandbox' })).toBeNull();
    expect(resolvePaypalClientEnv({ PAYPAL_ENV: 'sandbox', PAYPAL_CLIENT_ID: 'id' })).toBeNull();
    expect(
      resolvePaypalClientEnv({
        PAYPAL_ENV: 'sandbox',
        PAYPAL_CLIENT_ID: 'id',
        PAYPAL_CLIENT_SECRET: 'secret',
      }),
    ).toBeNull();
  });

  it('returns the typed client env once every value is present', () => {
    expect(
      resolvePaypalClientEnv({
        PAYPAL_ENV: 'live',
        PAYPAL_CLIENT_ID: 'id',
        PAYPAL_CLIENT_SECRET: 'secret',
        PAYPAL_WEBHOOK_ID: 'webhook-id',
      }),
    ).toEqual({
      paypalEnv: 'live',
      clientId: 'id',
      clientSecret: 'secret',
      webhookId: 'webhook-id',
    });
  });
});
