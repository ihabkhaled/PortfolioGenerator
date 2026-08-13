import 'server-only';

import { headers } from 'next/headers';

import { getAdminAuth } from '@/packages/admin-auth/server';
import { getDatabase } from '@/packages/database';
import { toAppRoute } from '@/packages/link';
import { logger } from '@/packages/logger';
import { appRedirect } from '@/packages/navigation';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { toAuthenticatedAdmin } from '../mappers/admin-user-to-authenticated-admin.mapper';
import { hasAdminPermission } from '../policies/admin-authorization.policy';
import type { AdminPermission, AuthenticatedAdmin } from '../types/admin.types';

/**
 * Session resolution for the isolated admin auth instance.
 *
 * Two levels, deliberately distinct: `getOptionalAdminSession` answers "is
 * there a password-authenticated admin session at all" — used only by the
 * sign-in flow and the 2FA enrollment page, both of which must render for an
 * admin who has passed their password check but not yet completed 2FA.
 * `getOptionalAdmin` answers "is this admin fully authenticated for the
 * dashboard" — session *and* `twoFactorEnabled === true` — and is what every
 * real management page and action calls.
 */
export async function getOptionalAdminSession(): Promise<AuthenticatedAdmin | null> {
  try {
    const requestHeaders = await headers();
    const session = await getAdminAuth().api.getSession({ headers: requestHeaders });

    if (!session?.user) {
      return null;
    }

    const row = await getDatabase().adminUser.findUnique({ where: { id: session.user.id } });

    if (!row) {
      return null;
    }

    return toAuthenticatedAdmin(row);
  } catch (error) {
    logger.warn('admin.session.lookup_failed', {
      reason: error instanceof Error ? error.name : 'unknown',
    });

    return null;
  }
}

export async function getOptionalAdmin(): Promise<AuthenticatedAdmin | null> {
  const requestHeaders = await headers();

  try {
    const session = await getAdminAuth().api.getSession({ headers: requestHeaders });

    if (session?.user.twoFactorEnabled !== true) {
      return null;
    }
  } catch {
    return null;
  }

  return getOptionalAdminSession();
}

/**
 * The authorization boundary for a `/managawy` page or action.
 *
 * Three outcomes: no session at all → sign-in. A session that has not
 * completed 2FA yet → the enrollment screen, never the requested page.
 * A fully authenticated admin who lacks the specific permission → thrown
 * error (this one is not a redirect: it means a UI bug let an admin reach a
 * control they should never have seen, and that is worth surfacing loudly
 * rather than silently bouncing them).
 */
export async function requireAdmin(permission: AdminPermission): Promise<AuthenticatedAdmin> {
  const sessionAdmin = await getOptionalAdminSession();

  if (!sessionAdmin) {
    appRedirect(toAppRoute(ROUTE_PATHS.managawySignIn));
  }

  const requestHeaders = await headers();
  const session = await getAdminAuth().api.getSession({ headers: requestHeaders });

  if (session?.user.twoFactorEnabled !== true) {
    appRedirect(toAppRoute(ROUTE_PATHS.managawyTwoFactorEnroll));
  }

  if (!hasAdminPermission(sessionAdmin, permission)) {
    throw new Error(`Missing admin permission: ${permission}`);
  }

  return sessionAdmin;
}
