import { describe, expect, it } from 'vitest';

import { parseServerEnvironment } from './server';

const base = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  BETTER_AUTH_SECRET: 'x'.repeat(32),
  BETTER_AUTH_URL: 'http://localhost:3000',
  ADMIN_AUTH_SECRET: 'y'.repeat(32),
};

describe('PayPal billing environment', () => {
  it('is disabled when every PayPal value is blank', () => {
    const parsed = parseServerEnvironment(base);

    expect(parsed.PAYPAL_CLIENT_ID).toBeUndefined();
    expect(parsed.PAYPAL_CLIENT_SECRET).toBeUndefined();
    expect(parsed.PAYPAL_WEBHOOK_ID).toBeUndefined();
    expect(parsed.NEXT_PUBLIC_PAYPAL_CLIENT_ID).toBeUndefined();
    expect(parsed.PAYPAL_ENV).toBe('sandbox');
  });

  it('rejects a partially configured PayPal setup', () => {
    expect(() => parseServerEnvironment({ ...base, PAYPAL_CLIENT_ID: 'client-id' })).toThrow(
      'PayPal billing requires',
    );
    expect(() =>
      parseServerEnvironment({
        ...base,
        PAYPAL_CLIENT_ID: 'client-id',
        PAYPAL_CLIENT_SECRET: 'client-secret',
      }),
    ).toThrow('PayPal billing requires');
    expect(() =>
      parseServerEnvironment({
        ...base,
        PAYPAL_CLIENT_ID: 'client-id',
        PAYPAL_CLIENT_SECRET: 'client-secret',
        PAYPAL_WEBHOOK_ID: 'webhook-id',
      }),
    ).toThrow('PayPal billing requires');
  });

  it('rejects a PayPal setup missing only the public client id', () => {
    expect(() =>
      parseServerEnvironment({
        ...base,
        PAYPAL_CLIENT_SECRET: 'client-secret',
        PAYPAL_WEBHOOK_ID: 'webhook-id',
      }),
    ).toThrow('PayPal billing requires');
  });

  it('accepts a complete PayPal configuration', () => {
    const parsed = parseServerEnvironment({
      ...base,
      PAYPAL_CLIENT_ID: 'client-id',
      PAYPAL_CLIENT_SECRET: 'client-secret',
      PAYPAL_WEBHOOK_ID: 'webhook-id',
      NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'client-id',
      PAYPAL_ENV: 'live',
    });

    expect(parsed.PAYPAL_CLIENT_ID).toBe('client-id');
    expect(parsed.PAYPAL_ENV).toBe('live');
  });

  it('defaults both prices to 2.50 and accepts a configured override', () => {
    expect(parseServerEnvironment(base).PAYMENT_PRICE).toBe('2.50');
    expect(parseServerEnvironment(base).NEXT_PAYMENT_PRICE).toBe('2.50');
    expect(parseServerEnvironment({ ...base, PAYMENT_PRICE: '5' }).PAYMENT_PRICE).toBe('5');
  });

  it('rejects a price that is not a plain decimal amount', () => {
    expect(() => parseServerEnvironment({ ...base, PAYMENT_PRICE: '$2.50' })).toThrow(
      'Invalid server environment',
    );
    expect(() => parseServerEnvironment({ ...base, PAYMENT_PRICE: '2.505' })).toThrow(
      'Invalid server environment',
    );
  });
});
