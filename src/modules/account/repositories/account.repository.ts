import 'server-only';

import { getDatabase } from '@/packages/database';
import { parseSchema } from '@/packages/zod';

import { accountPreferencesSchema } from '../schemas/account.schema';
import type { AccountPreferences } from '../types/settings.types';

/**
 * Account-level data access.
 *
 * Deleting a user is a hard delete, and the cascades in the schema do the rest:
 * sessions, credentials, portfolios, uploads and AI runs go with it. Audit
 * events do not — their owner reference is `SetNull`, so the record that a
 * publish or an account deletion happened survives the person it concerned
 * while the identifying data does not. That asymmetry is the point: an
 * append-only log that could be erased by the party it constrains is not a log.
 */
export async function hardDeleteUser(userId: string): Promise<boolean> {
  const deleted = await getDatabase().user.deleteMany({ where: { id: userId } });

  return deleted.count > 0;
}

export async function userExists(userId: string): Promise<boolean> {
  const row = await getDatabase().user.findFirst({ where: { id: userId }, select: { id: true } });

  return row !== null;
}

export async function getOwnedAccountPreferences(
  ownerId: string,
): Promise<AccountPreferences | null> {
  const row = await getDatabase().user.findFirst({
    where: { id: ownerId },
    select: { locale: true, themePreference: true, defaultCountryIso: true },
  });
  if (row === null) return null;
  const parsed = parseSchema(accountPreferencesSchema, row);
  return parsed.ok ? parsed.value : null;
}

export async function updateOwnedAccountPreferences(
  ownerId: string,
  preferences: AccountPreferences,
): Promise<boolean> {
  const updated = await getDatabase().user.updateMany({
    where: { id: ownerId },
    data: preferences,
  });
  return updated.count > 0;
}
