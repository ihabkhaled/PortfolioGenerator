import { describe, expect, it } from 'vitest';

import { passwordResetRequestSchema, passwordResetSchema } from '@/modules/auth';
import { parseSchema } from '@/packages/zod';

describe('password recovery input', () => {
  it('normalizes the address used for a reset request', () => {
    const result = parseSchema(passwordResetRequestSchema, { email: '  IHAB@example.com ' });

    expect(result).toEqual({ ok: true, value: { email: 'ihab@example.com' } });
  });

  it('rejects an invalid reset-request address', () => {
    expect(parseSchema(passwordResetRequestSchema, { email: 'not-an-address' }).ok).toBe(false);
  });

  it('accepts an opaque token with a strong replacement password', () => {
    const result = parseSchema(passwordResetSchema, {
      token: 'opaque-reset-token',
      newPassword: 'replacement-password-456',
    });

    expect(result).toEqual({
      ok: true,
      value: { token: 'opaque-reset-token', newPassword: 'replacement-password-456' },
    });
  });

  it('rejects a missing token', () => {
    expect(
      parseSchema(passwordResetSchema, {
        token: '',
        newPassword: 'replacement-password-456',
      }).ok,
    ).toBe(false);
  });

  it('rejects a weak replacement password', () => {
    expect(
      parseSchema(passwordResetSchema, { token: 'opaque-reset-token', newPassword: 'short' }).ok,
    ).toBe(false);
  });
});
