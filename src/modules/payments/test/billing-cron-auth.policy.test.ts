import { describe, expect, it } from 'vitest';

import { isAuthorizedBillingCronRequest } from '../policies/billing-cron-auth.policy';

describe('isAuthorizedBillingCronRequest', () => {
  it('accepts the exact configured bearer secret', () => {
    expect(isAuthorizedBillingCronRequest('Bearer secret-value', 'secret-value')).toBe(true);
  });

  it('rejects a missing authorization header', () => {
    expect(isAuthorizedBillingCronRequest(null, 'secret-value')).toBe(false);
  });

  it('rejects when no secret is configured', () => {
    expect(isAuthorizedBillingCronRequest('Bearer secret-value', undefined)).toBe(false);
  });

  it('rejects a mismatched secret', () => {
    expect(isAuthorizedBillingCronRequest('Bearer wrong', 'secret-value')).toBe(false);
  });

  it('rejects a header with the wrong scheme', () => {
    expect(isAuthorizedBillingCronRequest('Basic secret-value', 'secret-value')).toBe(false);
  });
});
