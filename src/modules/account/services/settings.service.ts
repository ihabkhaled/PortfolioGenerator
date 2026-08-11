import 'server-only';

import {
  PREFERENCE_COOKIE_MAX_AGE_SECONDS,
  SAVED_LOCALE_COOKIE,
  SAVED_THEME_COOKIE,
} from '@/modules/preferences';
import { getServerEnv } from '@/packages/env/server';
import { setResponseCookie } from '@/packages/headers';
import { THEME_ACCOUNT_SYNC_COOKIE } from '@/packages/theme';

import {
  getOwnedAccountPreferences,
  updateOwnedAccountPreferences,
} from '../repositories/account.repository';
import type { AccountPreferences } from '../types/settings.types';

export { getOwnedAccountPreferences } from '../repositories/account.repository';

export async function writeAccountPreferenceCookies(
  preferences: AccountPreferences,
): Promise<void> {
  const secure = getServerEnv().NODE_ENV === 'production';
  await Promise.all([
    setResponseCookie(SAVED_LOCALE_COOKIE, preferences.locale, {
      httpOnly: true,
      maxAge: PREFERENCE_COOKIE_MAX_AGE_SECONDS,
      secure,
    }),
    setResponseCookie(SAVED_THEME_COOKIE, preferences.themePreference, {
      httpOnly: false,
      maxAge: PREFERENCE_COOKIE_MAX_AGE_SECONDS,
      secure,
    }),
    setResponseCookie(THEME_ACCOUNT_SYNC_COOKIE, '1', {
      httpOnly: false,
      maxAge: 120,
      secure,
    }),
  ]);
}

export async function synchronizeOwnedAccountPreferences(ownerId: string): Promise<boolean> {
  const preferences = await getOwnedAccountPreferences(ownerId);
  if (preferences === null) return false;
  await writeAccountPreferenceCookies(preferences);
  return true;
}

export async function saveOwnedAccountPreferences(
  ownerId: string,
  preferences: AccountPreferences,
): Promise<boolean> {
  return updateOwnedAccountPreferences(ownerId, preferences);
}
