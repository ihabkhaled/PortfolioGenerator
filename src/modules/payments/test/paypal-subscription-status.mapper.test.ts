import { describe, expect, it } from 'vitest';

import { fromPaypalSubscriptionStatus } from '../mappers/paypal-subscription-status.mapper';

describe('fromPaypalSubscriptionStatus', () => {
  it('maps every known PayPal status to this app’s vocabulary', () => {
    expect(fromPaypalSubscriptionStatus('APPROVAL_PENDING')).toBe('TRIALING');
    expect(fromPaypalSubscriptionStatus('APPROVED')).toBe('TRIALING');
    expect(fromPaypalSubscriptionStatus('ACTIVE')).toBe('ACTIVE');
    expect(fromPaypalSubscriptionStatus('SUSPENDED')).toBe('PAST_DUE');
    expect(fromPaypalSubscriptionStatus('CANCELLED')).toBe('CANCELED');
    expect(fromPaypalSubscriptionStatus('EXPIRED')).toBe('CANCELED');
  });

  it('falls back to TRIALING for a status this app has not seen before, never ACTIVE', () => {
    expect(fromPaypalSubscriptionStatus('SOME_FUTURE_STATUS')).toBe('TRIALING');
    expect(fromPaypalSubscriptionStatus('')).toBe('TRIALING');
  });
});
