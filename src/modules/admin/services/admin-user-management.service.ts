import 'server-only';

import { setUserAccountStatus } from '@/modules/auth/server';
import { getAuth } from '@/packages/auth/server';
import { logger } from '@/packages/logger';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import type { AdminUserStatus } from '../types/admin.types';

/**
 * The business logic between the users-management actions and the two
 * systems they change: the platform's own `User.status` column, and
 * better-auth's password-reset flow.
 */

/**
 * `setUserAccountStatus` reports `false` when its `updateMany` matches zero
 * rows — which happens exactly when `userId` names no user, since the write
 * itself carries no other precondition. That single boolean is what makes
 * this call blocked-for-missing-users and idempotent-safe at once: an
 * existing user gets the same status written every time a caller repeats the
 * request, a nonexistent one returns `false` every time.
 */
export async function setManagedUserAccountStatus(
  userId: string,
  status: AdminUserStatus,
): Promise<boolean> {
  return setUserAccountStatus(userId, status);
}

/**
 * Reuses the exact user-facing recovery flow — `getAuth()`, not
 * `getAdminAuth()` — so the admin never sees or sets a password; the email
 * that goes out and the link it contains are identical to a self-service
 * request. better-auth gives unknown-email and delivery failures the same
 * shape as success on purpose (see `requestPasswordRecovery` in
 * `src/modules/auth/services/password-recovery.service.ts`), but the caller
 * here already knows the user exists, so an actual thrown error is worth
 * surfacing to the admin rather than swallowing.
 */
export async function sendManagedUserPasswordReset(email: string): Promise<boolean> {
  try {
    await getAuth().api.requestPasswordReset({
      body: { email, redirectTo: ROUTE_PATHS.resetPassword },
    });

    return true;
  } catch (error) {
    logger.warn('admin.users.password_reset_request_failed', {
      reason: error instanceof Error ? error.name : 'unknown',
    });

    return false;
  }
}
