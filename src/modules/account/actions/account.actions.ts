'use server';

import { headers } from 'next/headers';

import { requireOwner, signOutCurrentSession } from '@/modules/auth/server';
import { getAuth } from '@/packages/auth/server';
import { logger } from '@/packages/logger';
import { appRedirect } from '@/packages/navigation';
import { parseSchema } from '@/packages/zod';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { ACCOUNT_ERROR_KEYS } from '../constants/deletion.constants';
import {
  ACCOUNT_SETTINGS_ERROR_KEYS,
  ACCOUNT_SETTINGS_FIELD_NAMES,
} from '../constants/settings.constants';
import {
  accountDeletionSchema,
  accountPasswordSchema,
  accountPreferencesSchema,
  accountProfileSchema,
  portfolioDeletionSchema,
} from '../schemas/account.schema';
import { deleteAccount, deletePortfolio } from '../services/deletion.service';
import {
  saveOwnedAccountPreferences,
  writeAccountPreferenceCookies,
} from '../services/settings.service';
import type { AccountActionState } from '../types/deletion.types';
import type { AccountSettingsActionState } from '../types/settings.types';

export async function updateAccountPreferencesAction(
  _previous: AccountSettingsActionState,
  formData: FormData,
): Promise<AccountSettingsActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(accountPreferencesSchema, {
    locale: formData.get(ACCOUNT_SETTINGS_FIELD_NAMES.locale),
    themePreference: formData.get(ACCOUNT_SETTINGS_FIELD_NAMES.themePreference),
    defaultCountryIso: formData.get(ACCOUNT_SETTINGS_FIELD_NAMES.defaultCountryIso),
  });
  if (!parsed.ok) return { status: 'error', error: ACCOUNT_SETTINGS_ERROR_KEYS.unknown };
  const saved = await saveOwnedAccountPreferences(owner.id, parsed.value);
  if (saved) {
    await writeAccountPreferenceCookies(parsed.value);
  }
  return saved
    ? { status: 'success', error: null }
    : { status: 'error', error: ACCOUNT_SETTINGS_ERROR_KEYS.unknown };
}

export async function updateAccountProfileAction(
  _previous: AccountSettingsActionState,
  formData: FormData,
): Promise<AccountSettingsActionState> {
  await requireOwner();
  const parsed = parseSchema(accountProfileSchema, {
    name: formData.get(ACCOUNT_SETTINGS_FIELD_NAMES.name),
  });

  if (!parsed.ok) {
    return { status: 'error', error: ACCOUNT_SETTINGS_ERROR_KEYS.invalidProfile };
  }

  try {
    await getAuth().api.updateUser({ body: { name: parsed.value.name }, headers: await headers() });
  } catch {
    logger.warn('account.profile_update.failed');

    return { status: 'error', error: ACCOUNT_SETTINGS_ERROR_KEYS.unknown };
  }

  return { status: 'success', error: null };
}

export async function changeAccountPasswordAction(
  _previous: AccountSettingsActionState,
  formData: FormData,
): Promise<AccountSettingsActionState> {
  await requireOwner();
  const parsed = parseSchema(accountPasswordSchema, {
    currentPassword: formData.get(ACCOUNT_SETTINGS_FIELD_NAMES.currentPassword),
    newPassword: formData.get(ACCOUNT_SETTINGS_FIELD_NAMES.newPassword),
  });

  if (!parsed.ok) {
    return { status: 'error', error: ACCOUNT_SETTINGS_ERROR_KEYS.invalidPassword };
  }

  try {
    const requestHeaders = await headers();
    await getAuth().api.changePassword({
      body: {
        currentPassword: parsed.value.currentPassword,
        newPassword: parsed.value.newPassword,
        revokeOtherSessions: false,
      },
      headers: requestHeaders,
    });
    await getAuth().api.revokeOtherSessions({ headers: requestHeaders });
  } catch {
    logger.info('account.password_change.rejected');

    return { status: 'error', error: ACCOUNT_SETTINGS_ERROR_KEYS.currentPasswordRejected };
  }

  return { status: 'success', error: null };
}

export async function resendEmailVerificationAction(
  _previous: AccountSettingsActionState,
): Promise<AccountSettingsActionState> {
  const owner = await requireOwner();

  if (owner.emailVerified) return { status: 'success', error: null };

  try {
    await getAuth().api.sendVerificationEmail({
      body: { email: owner.email, callbackURL: ROUTE_PATHS.dashboard },
      headers: await headers(),
    });
  } catch {
    logger.warn('account.email_verification.failed');
    return { status: 'error', error: ACCOUNT_SETTINGS_ERROR_KEYS.unknown };
  }

  return { status: 'success', error: null };
}

export async function revokeAccountSessionAction(
  _previous: AccountSettingsActionState,
  formData: FormData,
): Promise<AccountSettingsActionState> {
  await requireOwner();
  const token = formData.get(ACCOUNT_SETTINGS_FIELD_NAMES.sessionToken);
  if (typeof token !== 'string' || token.length === 0) {
    return { status: 'error', error: ACCOUNT_SETTINGS_ERROR_KEYS.unknown };
  }

  try {
    await getAuth().api.revokeSession({ body: { token }, headers: await headers() });
  } catch {
    logger.warn('account.session_revoke.failed');
    return { status: 'error', error: ACCOUNT_SETTINGS_ERROR_KEYS.unknown };
  }

  return { status: 'success', error: null };
}

/**
 * Deletion, as server actions.
 *
 * Both resolve the owner first and pass only an owner id downstream — a server
 * action is a public endpoint, and "the page already checked" is not a check.
 */

export async function deletePortfolioAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(portfolioDeletionSchema, { portfolioId: formData.get('portfolioId') });

  if (!parsed.ok) {
    return { status: 'error', error: ACCOUNT_ERROR_KEYS.notFound };
  }

  const result = await deletePortfolio(owner.id, parsed.value.portfolioId, new Date());

  if (!result.ok) {
    return { status: 'error', error: ACCOUNT_ERROR_KEYS.notFound };
  }

  logger.info('account.portfolio_deleted', {
    objectsFailed: result.summary.objectsFailed,
    uploads: result.summary.uploads,
  });

  appRedirect(ROUTE_PATHS.dashboard);
}

/**
 * Delete the account, then end the session and land on the marketing page.
 *
 * The sign-out is not cosmetic: the session row is gone with the user, so the
 * cookie now points at nothing. Clearing it explicitly is what stops the next
 * request from being an authentication error the user cannot act on.
 */
export async function deleteAccountAction(
  _previous: AccountActionState,
  formData: FormData,
): Promise<AccountActionState> {
  const owner = await requireOwner();
  const parsed = parseSchema(accountDeletionSchema, { confirmation: formData.get('confirmation') });

  if (!parsed.ok) {
    return { status: 'error', error: ACCOUNT_ERROR_KEYS.confirmationMismatch };
  }

  const result = await deleteAccount(owner.id, new Date());

  if (!result.ok) {
    return { status: 'error', error: ACCOUNT_ERROR_KEYS.deleteFailed };
  }

  logger.info('account.deleted', {
    portfolios: result.summary.portfolios,
    objectsFailed: result.summary.objectsFailed,
  });

  await signOutCurrentSession(await headers());

  appRedirect(ROUTE_PATHS.home);
}
