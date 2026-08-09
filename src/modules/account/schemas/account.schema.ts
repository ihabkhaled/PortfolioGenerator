import { APP_LOCALES } from '@/modules/localization';
import { AUTH_MAX_PASSWORD_LENGTH, AUTH_MIN_PASSWORD_LENGTH } from '@/packages/auth';
import { THEME_PREFERENCES } from '@/packages/theme';
import { z } from '@/packages/zod';

import { ACCOUNT_DELETE_CONFIRMATION } from '../constants/deletion.constants';
import { ACCOUNT_COUNTRY_ISOS } from '../constants/settings.constants';

export const portfolioDeletionSchema = z.object({
  portfolioId: z.string().min(1).max(120),
});

/**
 * The typed confirmation is validated on the server, not only in the browser.
 *
 * The client check is a courtesy; this one is the guarantee. A form post that
 * skips the field entirely — a stale tab, a script, a mis-fired fetch — must
 * not be able to delete an account because the interruption lived in a React
 * component.
 */
export const accountDeletionSchema = z.object({
  confirmation: z.literal(ACCOUNT_DELETE_CONFIRMATION),
});

export const accountProfileSchema = z.object({
  name: z.string().trim().min(1, 'errors.nameRequired').max(120, 'errors.nameRequired'),
});

export const accountPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'errors.invalidCredentials').max(AUTH_MAX_PASSWORD_LENGTH),
    newPassword: z
      .string()
      .min(AUTH_MIN_PASSWORD_LENGTH, 'errors.weakPassword')
      .max(AUTH_MAX_PASSWORD_LENGTH, 'errors.weakPassword'),
  })
  .refine(({ currentPassword, newPassword }) => currentPassword !== newPassword, {
    message: 'errors.passwordReused',
    path: ['newPassword'],
  });

export const accountPreferencesSchema = z.object({
  locale: z.enum(APP_LOCALES),
  themePreference: z.enum(THEME_PREFERENCES),
  defaultCountryIso: z.preprocess(
    (value) => (value === '' ? null : value),
    z
      .string()
      .nullable()
      .refine(
        (value) => value === null || ACCOUNT_COUNTRY_ISOS.includes(value),
        'errors.invalidPreferences',
      ),
  ),
});
