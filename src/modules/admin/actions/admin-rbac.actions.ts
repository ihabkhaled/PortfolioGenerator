'use server';

import { invalidatePath } from '@/packages/cache';
import { parseSchema } from '@/packages/zod';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import {
  ADMIN_RBAC_ACTION_MESSAGE_KEYS,
  ADMIN_RBAC_FIELD_NAMES,
} from '../constants/admin-rbac.constants';
import {
  buildAdminPermissionDiffMetadata,
  diffAdminPermissions,
  isAdminRbacSelfLockout,
} from '../helpers/admin-permission-diff.helper';
import { assertNotSuperAdmin } from '../policies/admin-authorization.policy';
import {
  getAdminUserForRbac,
  writeAdminUserPermissions,
} from '../repositories/admin-rbac.repository';
import { adminRbacPermissionsUpdateSchema } from '../schemas/admin-rbac.schema';
import { recordAdminAuditEvent } from '../services/admin-audit.service';
import { requireAdmin } from '../services/admin-session.service';
import type { AdminRbacActionState } from '../types/admin-rbac-action-view.types';

/**
 * Overwrites one admin's entire `permissions` array — never a merge, the
 * documented Phase 3 design. Four guards run, in order, before anything is
 * written: the schema (well-formed input), `assertNotSuperAdmin` on the
 * *target* row (never the caller's own role or permissions), the
 * self-lockout check (a caller cannot remove `RBAC_MANAGE` from their own
 * account, even though they hold `RBAC_MANAGE` and would otherwise be
 * allowed to), and only then the write itself.
 */
export async function saveAdminUserPermissionsAction(
  _previous: AdminRbacActionState,
  formData: FormData,
): Promise<AdminRbacActionState> {
  const caller = await requireAdmin('RBAC_MANAGE');
  const parsed = parseSchema(adminRbacPermissionsUpdateSchema, {
    adminId: formData.get(ADMIN_RBAC_FIELD_NAMES.adminId),
    permissions: formData.getAll(ADMIN_RBAC_FIELD_NAMES.permissions),
  });

  if (!parsed.ok) {
    return { status: 'error', message: ADMIN_RBAC_ACTION_MESSAGE_KEYS.invalid };
  }

  const target = await getAdminUserForRbac(parsed.value.adminId);

  if (target === null) {
    return { status: 'error', message: ADMIN_RBAC_ACTION_MESSAGE_KEYS.notFound };
  }

  try {
    assertNotSuperAdmin(target);
  } catch {
    return { status: 'error', message: ADMIN_RBAC_ACTION_MESSAGE_KEYS.superAdminLocked };
  }

  if (isAdminRbacSelfLockout(caller.id, target.id, parsed.value.permissions)) {
    return { status: 'error', message: ADMIN_RBAC_ACTION_MESSAGE_KEYS.selfLockout };
  }

  const diff = diffAdminPermissions(target.permissions, parsed.value.permissions);

  await writeAdminUserPermissions(target.id, parsed.value.permissions);

  await recordAdminAuditEvent({
    adminUserId: caller.id,
    targetType: 'ADMIN_USER',
    targetId: target.id,
    action: 'admin.rbac.permissions_updated',
    metadata: buildAdminPermissionDiffMetadata(diff),
  });

  invalidatePath(ROUTE_PATHS.managawyRbac);

  return {
    status: 'success',
    message: diff.changed
      ? ADMIN_RBAC_ACTION_MESSAGE_KEYS.saved
      : ADMIN_RBAC_ACTION_MESSAGE_KEYS.noChange,
  };
}
