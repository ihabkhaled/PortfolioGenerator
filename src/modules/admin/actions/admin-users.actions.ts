'use server';

import { invalidatePath } from '@/packages/cache';
import { parseSchema } from '@/packages/zod';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import { ADMIN_USER_ACTION_MESSAGE_KEYS } from '../constants/admin-users.constants';
import { buildAdminUserDetailPath } from '../helpers/admin-users-path.helper';
import { getAdminUserDetail } from '../repositories/admin-users.repository';
import { adminUserIdSchema, adminUserStatusChangeSchema } from '../schemas/admin-users.schema';
import { recordAdminAuditEvent } from '../services/admin-audit.service';
import { requireAdmin } from '../services/admin-session.service';
import {
  sendManagedUserPasswordReset,
  setManagedUserAccountStatus,
} from '../services/admin-user-management.service';
import type { AdminUserActionState } from '../types/admin-user-action-view.types';

/**
 * Both actions gate on the specific permission the task calls for —
 * `USERS_SUSPEND` covers both directions of the same column, since
 * suspending and lifting a suspension are the same authority — perform the
 * change, record an audit event, and invalidate both places the target user
 * can be rendered: the list page and their own detail page. A row action
 * fired from either page keeps both correct without the caller having to say
 * which one it came from.
 */

export async function setUserAccountStatusAction(
  _previous: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const admin = await requireAdmin('USERS_SUSPEND');
  const parsed = parseSchema(adminUserStatusChangeSchema, {
    userId: formData.get('userId'),
    status: formData.get('status'),
  });

  if (!parsed.ok) {
    return { status: 'error', message: ADMIN_USER_ACTION_MESSAGE_KEYS.invalid };
  }

  const updated = await setManagedUserAccountStatus(parsed.value.userId, parsed.value.status);

  if (!updated) {
    return { status: 'error', message: ADMIN_USER_ACTION_MESSAGE_KEYS.notFound };
  }

  await recordAdminAuditEvent({
    adminUserId: admin.id,
    targetType: 'USER',
    targetId: parsed.value.userId,
    action: parsed.value.status === 'SUSPENDED' ? 'admin.user.suspended' : 'admin.user.activated',
  });

  invalidatePath(ROUTE_PATHS.managawyUsers);
  invalidatePath(buildAdminUserDetailPath(parsed.value.userId));

  return {
    status: 'success',
    message:
      parsed.value.status === 'SUSPENDED'
        ? ADMIN_USER_ACTION_MESSAGE_KEYS.suspended
        : ADMIN_USER_ACTION_MESSAGE_KEYS.activated,
  };
}

/**
 * The admin never sees or sets a password: this looks the target user up for
 * their current email and hands it to the same request-password-reset flow a
 * signed-out visitor uses at `/forgot-password`.
 */
export async function resetUserPasswordAction(
  _previous: AdminUserActionState,
  formData: FormData,
): Promise<AdminUserActionState> {
  const admin = await requireAdmin('USERS_RESET_PASSWORD');
  const parsed = parseSchema(adminUserIdSchema, { userId: formData.get('userId') });

  if (!parsed.ok) {
    return { status: 'error', message: ADMIN_USER_ACTION_MESSAGE_KEYS.invalid };
  }

  const user = await getAdminUserDetail(parsed.value.userId);

  if (user === null) {
    return { status: 'error', message: ADMIN_USER_ACTION_MESSAGE_KEYS.notFound };
  }

  const sent = await sendManagedUserPasswordReset(user.email);

  if (!sent) {
    return { status: 'error', message: ADMIN_USER_ACTION_MESSAGE_KEYS.resetFailed };
  }

  await recordAdminAuditEvent({
    adminUserId: admin.id,
    targetType: 'USER',
    targetId: user.id,
    action: 'admin.user.password_reset_requested',
  });

  invalidatePath(ROUTE_PATHS.managawyUsers);
  invalidatePath(buildAdminUserDetailPath(user.id));

  return { status: 'success', message: ADMIN_USER_ACTION_MESSAGE_KEYS.resetSent };
}
