import { describe, expect, it } from 'vitest';

import {
  describeBillingStatus,
  isEligibleForDeactivation,
} from '../policies/billing-status.policy';
import type { OwnerBillingState } from '../types/payments.types';

const now = new Date('2026-08-10T00:00:00.000Z');

function state(overrides: Partial<OwnerBillingState>): OwnerBillingState {
  return {
    trialStartedAt: null,
    trialEndsAt: null,
    subscriptionStatus: 'NONE',
    paypalSubscriptionId: null,
    ...overrides,
  };
}

describe('describeBillingStatus', () => {
  it('reports active regardless of trial state', () => {
    expect(describeBillingStatus(state({ subscriptionStatus: 'ACTIVE' }), now)).toEqual({
      tag: 'active',
      daysRemaining: null,
    });

    // Even a trial that has technically already lapsed does not override an
    // active subscription — ACTIVE always wins.
    expect(
      describeBillingStatus(
        state({ subscriptionStatus: 'ACTIVE', trialEndsAt: new Date('2020-01-01') }),
        now,
      ),
    ).toEqual({ tag: 'active', daysRemaining: null });
  });

  it('reports not-started when no trial has ever begun', () => {
    expect(describeBillingStatus(state({ subscriptionStatus: 'NONE' }), now)).toEqual({
      tag: 'notStarted',
      daysRemaining: null,
    });
  });

  it('reports trialing with the whole days remaining', () => {
    expect(
      describeBillingStatus(
        state({
          subscriptionStatus: 'TRIALING',
          trialEndsAt: new Date('2026-08-13T00:00:00.000Z'),
        }),
        now,
      ),
    ).toEqual({ tag: 'trialing', daysRemaining: 3 });
  });

  it('reports deactivated once the trial has ended without an active subscription', () => {
    expect(
      describeBillingStatus(
        state({
          subscriptionStatus: 'PAST_DUE',
          trialEndsAt: new Date('2026-08-01T00:00:00.000Z'),
        }),
        now,
      ),
    ).toEqual({ tag: 'deactivated', daysRemaining: 0 });

    expect(
      describeBillingStatus(
        state({
          subscriptionStatus: 'CANCELED',
          trialEndsAt: new Date('2026-08-01T00:00:00.000Z'),
        }),
        now,
      ),
    ).toEqual({ tag: 'deactivated', daysRemaining: 0 });
  });
});

describe('isEligibleForDeactivation', () => {
  it('is false for an active subscriber', () => {
    expect(
      isEligibleForDeactivation(
        state({ subscriptionStatus: 'ACTIVE', trialEndsAt: new Date('2020-01-01') }),
        now,
      ),
    ).toBe(false);
  });

  it('is false when there is no trial to have expired', () => {
    expect(isEligibleForDeactivation(state({ subscriptionStatus: 'NONE' }), now)).toBe(false);
  });

  it('is false while the trial is still running', () => {
    expect(
      isEligibleForDeactivation(
        state({
          subscriptionStatus: 'TRIALING',
          trialEndsAt: new Date('2026-08-11T00:00:00.000Z'),
        }),
        now,
      ),
    ).toBe(false);
  });

  it('is true once the trial end instant has passed for a non-active status', () => {
    expect(
      isEligibleForDeactivation(
        state({
          subscriptionStatus: 'TRIALING',
          trialEndsAt: new Date('2026-08-10T00:00:00.000Z'),
        }),
        now,
      ),
    ).toBe(true);
  });
});
