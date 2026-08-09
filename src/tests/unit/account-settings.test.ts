import { describe, expect, it } from 'vitest';

import {
  accountPasswordSchema,
  accountPreferencesSchema,
  accountProfileSchema,
} from '@/modules/account';
import { parseSchema } from '@/packages/zod';

describe('account settings', () => {
  it('trims a valid display name', () => {
    const result = parseSchema(accountProfileSchema, { name: '  Ihab Khaled  ' });

    expect(result).toEqual({ ok: true, value: { name: 'Ihab Khaled' } });
  });

  it('rejects an empty display name', () => {
    const result = parseSchema(accountProfileSchema, { name: ' '.repeat(3) });

    expect(result.ok).toBe(false);
  });

  it('accepts a current password and a different strong replacement', () => {
    const result = parseSchema(accountPasswordSchema, {
      currentPassword: 'current-password-123',
      newPassword: 'replacement-password-456',
    });

    expect(result).toEqual({
      ok: true,
      value: {
        currentPassword: 'current-password-123',
        newPassword: 'replacement-password-456',
      },
    });
  });

  it('rejects a replacement that is shorter than the password policy', () => {
    const result = parseSchema(accountPasswordSchema, {
      currentPassword: 'current-password-123',
      newPassword: 'too-short',
    });

    expect(result.ok).toBe(false);
  });

  it('rejects reusing the current password', () => {
    const result = parseSchema(accountPasswordSchema, {
      currentPassword: 'same-password-123',
      newPassword: 'same-password-123',
    });

    expect(result.ok).toBe(false);
  });

  it('accepts supported persisted preferences', () => {
    expect(
      parseSchema(accountPreferencesSchema, {
        locale: 'ar',
        themePreference: 'dark',
        defaultCountryIso: 'EG',
      }),
    ).toEqual({
      ok: true,
      value: { locale: 'ar', themePreference: 'dark', defaultCountryIso: 'EG' },
    });
  });

  it('rejects unsupported locales, themes and country codes', () => {
    expect(
      parseSchema(accountPreferencesSchema, {
        locale: 'xx',
        themePreference: 'neon',
        defaultCountryIso: 'ZZ',
      }).ok,
    ).toBe(false);
  });

  it('stores an empty default country as no preference', () => {
    expect(
      parseSchema(accountPreferencesSchema, {
        locale: 'en',
        themePreference: 'system',
        defaultCountryIso: '',
      }),
    ).toEqual({
      ok: true,
      value: { locale: 'en', themePreference: 'system', defaultCountryIso: null },
    });
  });
});
