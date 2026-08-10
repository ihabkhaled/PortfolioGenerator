import { describe, expect, it } from 'vitest';

import { parseSchema } from '@/packages/zod';

import { subscriptionApprovalSchema } from '../schemas/subscription-approval.schema';

describe('subscriptionApprovalSchema', () => {
  it('accepts a well-formed PayPal subscription id, trimmed', () => {
    expect(parseSchema(subscriptionApprovalSchema, { subscriptionId: '  I-ABC123XYZ  ' })).toEqual({
      ok: true,
      value: { subscriptionId: 'I-ABC123XYZ' },
    });
  });

  it('rejects an empty id', () => {
    expect(parseSchema(subscriptionApprovalSchema, { subscriptionId: '' }).ok).toBe(false);
  });

  it('rejects an id longer than 64 characters', () => {
    expect(
      parseSchema(subscriptionApprovalSchema, { subscriptionId: 'I-'.padEnd(65, 'A') }).ok,
    ).toBe(false);
  });

  it('rejects characters outside the alphanumeric-and-hyphen set', () => {
    expect(parseSchema(subscriptionApprovalSchema, { subscriptionId: 'I-ABC 123' }).ok).toBe(false);
    expect(parseSchema(subscriptionApprovalSchema, { subscriptionId: '<script>' }).ok).toBe(false);
  });

  it('rejects a non-string value', () => {
    expect(parseSchema(subscriptionApprovalSchema, { subscriptionId: 12_345 }).ok).toBe(false);
  });
});
