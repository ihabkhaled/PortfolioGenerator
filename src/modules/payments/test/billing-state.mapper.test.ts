import { describe, expect, it } from 'vitest';

import { toOwnerBillingState } from '../mappers/billing-state.mapper';

describe('toOwnerBillingState', () => {
  it('carries every field through unchanged, narrowing the status string', () => {
    const trialStartedAt = new Date('2026-08-01T00:00:00.000Z');
    const trialEndsAt = new Date('2026-08-11T00:00:00.000Z');

    expect(
      toOwnerBillingState({
        trialStartedAt,
        trialEndsAt,
        subscriptionStatus: 'TRIALING',
        paypalSubscriptionId: 'I-SUB123',
      }),
    ).toEqual({
      trialStartedAt,
      trialEndsAt,
      subscriptionStatus: 'TRIALING',
      paypalSubscriptionId: 'I-SUB123',
    });
  });

  it('carries a never-published, never-subscribed row through as nulls', () => {
    expect(
      toOwnerBillingState({
        trialStartedAt: null,
        trialEndsAt: null,
        subscriptionStatus: 'NONE',
        paypalSubscriptionId: null,
      }),
    ).toEqual({
      trialStartedAt: null,
      trialEndsAt: null,
      subscriptionStatus: 'NONE',
      paypalSubscriptionId: null,
    });
  });
});
