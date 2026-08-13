import 'server-only';

import { getDatabase } from '@/packages/database';

import { toAccountStatus } from '../mappers/user-account.mapper';
import type { AccountStatus } from '../types/auth.types';

/**
 * `User.status` access outside better-auth's own contract.
 *
 * better-auth's session object never carries app-added columns — see
 * `getOwnedAccountPreferences` in the account module for the same shape of
 * problem with `locale` and `themePreference` — so enforcing a suspension
 * costs one indexed lookup by id here, not a change to the library.
 */
export async function getUserAccountStatus(userId: string): Promise<AccountStatus | null> {
  const row = await getDatabase().user.findFirst({
    where: { id: userId },
    select: { status: true },
  });

  return row === null ? null : toAccountStatus(row);
}

/**
 * Narrowly named so an admin action can flip an account's status without
 * deep-importing this repository — see `src/modules/auth/server.ts`. Not
 * owner-scoped: the caller is an administrator acting on someone else's
 * account, not the account holder acting on their own.
 */
export async function setUserAccountStatus(
  userId: string,
  status: AccountStatus,
): Promise<boolean> {
  const updated = await getDatabase().user.updateMany({
    where: { id: userId },
    data: { status },
  });

  return updated.count > 0;
}
