import { describe, expect, it } from 'vitest';

import { toAccountStatus } from '../mappers/user-account.mapper';

describe('toAccountStatus', () => {
  it('narrows an active row to ACTIVE', () => {
    expect(toAccountStatus({ status: 'ACTIVE' })).toBe('ACTIVE');
  });

  it('narrows a suspended row to SUSPENDED', () => {
    expect(toAccountStatus({ status: 'SUSPENDED' })).toBe('SUSPENDED');
  });
});
