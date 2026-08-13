'use server';

import { headers } from 'next/headers';

import { getAdminAuth } from '@/packages/admin-auth/server';
import { toAppRoute } from '@/packages/link';
import { logger } from '@/packages/logger';
import { appRedirect } from '@/packages/navigation';
import { parseSchema } from '@/packages/zod';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import {
  ADMIN_ACCOUNT_ERROR_KEYS,
  ADMIN_ACCOUNT_FIELD_NAMES,
} from '../constants/admin-account.constants';
import { adminPasswordSchema } from '../schemas/admin-account.schema';
import { recordAdminAuditEvent } from '../services/admin-audit.service';
import { requireAdmin } from '../services/admin-session.service';
import type { AdminAccountActionState } from '../types/admin-account-view.types';

/**
 * Both actions gate on `USERS_VIEW` — the same floor `(dashboard)/layout.tsx`
 * uses: the one permission every role has by default. Self-service on one's
 * own account (changing a password, signing out) is not the fine-grained
 * `ADMINS_MANAGE`/`RBAC_MANAGE` guard elsewhere, but it still has to run
 * behind a real, 2FA-verified admin session rather than trusting that a
 * layout check ran first.
 */
export async function adminChangePasswordAction(
  _previous: AdminAccountActionState,
  formData: FormData,
): Promise<AdminAccountActionState> {
  const admin = await requireAdmin('USERS_VIEW');
  const parsed = parseSchema(adminPasswordSchema, {
    currentPassword: formData.get(ADMIN_ACCOUNT_FIELD_NAMES.currentPassword),
    newPassword: formData.get(ADMIN_ACCOUNT_FIELD_NAMES.newPassword),
  });

  if (!parsed.ok) {
    return {
      status: 'error',
      error: parsed.issues[0]?.message ?? ADMIN_ACCOUNT_ERROR_KEYS.unknown,
    };
  }

  try {
    await getAdminAuth().api.changePassword({
      body: {
        currentPassword: parsed.value.currentPassword,
        newPassword: parsed.value.newPassword,
        revokeOtherSessions: true,
      },
      headers: await headers(),
    });
  } catch {
    logger.info('admin.password_change.rejected');

    return { status: 'error', error: ADMIN_ACCOUNT_ERROR_KEYS.currentPasswordRejected };
  }

  await recordAdminAuditEvent({
    adminUserId: admin.id,
    targetType: 'ADMIN_USER',
    targetId: admin.id,
    action: 'admin.password.changed',
  });

  return { status: 'success', error: null };
}

export async function adminSignOutAction(): Promise<void> {
  const admin = await requireAdmin('USERS_VIEW');

  await getAdminAuth().api.signOut({ headers: await headers() });

  await recordAdminAuditEvent({
    adminUserId: admin.id,
    targetType: 'ADMIN_USER',
    targetId: admin.id,
    action: 'admin.session.signed_out',
  });

  appRedirect(toAppRoute(ROUTE_PATHS.managawySignIn));
}
