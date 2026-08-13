import { describe, expect, it } from 'vitest';

import { ADMIN_AUTH_MIN_PASSWORD_LENGTH } from '@/packages/admin-auth/admin-auth.constants';
import { parseSchema } from '@/packages/zod';

import { adminPasswordSchema } from '../schemas/admin-account.schema';

describe('adminPasswordSchema', () => {
  it('accepts a current password and a different, sufficiently long replacement', () => {
    const result = parseSchema(adminPasswordSchema, {
      currentPassword: 'current-admin-password',
      newPassword: 'a'.repeat(ADMIN_AUTH_MIN_PASSWORD_LENGTH),
    });

    expect(result).toEqual({
      ok: true,
      value: {
        currentPassword: 'current-admin-password',
        newPassword: 'a'.repeat(ADMIN_AUTH_MIN_PASSWORD_LENGTH),
      },
    });
  });

  it('rejects a missing current password with its own message key', () => {
    const result = parseSchema(adminPasswordSchema, {
      currentPassword: '',
      newPassword: 'a'.repeat(ADMIN_AUTH_MIN_PASSWORD_LENGTH),
    });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.issues[0]?.message).toBe('errors.currentPasswordRejected');
  });

  it('rejects a replacement shorter than the admin password floor with its own message key', () => {
    const result = parseSchema(adminPasswordSchema, {
      currentPassword: 'current-admin-password',
      newPassword: 'a'.repeat(ADMIN_AUTH_MIN_PASSWORD_LENGTH - 1),
    });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.issues[0]?.message).toBe('errors.weakPassword');
  });

  it('rejects reusing the current password with its own message key, not the weak-password one', () => {
    const result = parseSchema(adminPasswordSchema, {
      currentPassword: 'a'.repeat(ADMIN_AUTH_MIN_PASSWORD_LENGTH),
      newPassword: 'a'.repeat(ADMIN_AUTH_MIN_PASSWORD_LENGTH),
    });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.issues[0]?.message).toBe('errors.passwordReused');
  });
});
