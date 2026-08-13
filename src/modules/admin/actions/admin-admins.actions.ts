'use server';

import { invalidatePath } from '@/packages/cache';
import { parseSchema } from '@/packages/zod';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import {
  ADMIN_ADMIN_ACTION_MESSAGE_KEYS,
  ADMIN_ADMIN_FIELD_NAMES,
} from '../constants/admin-admins.constants';
import { assertNotSelfTarget, assertNotSuperAdmin } from '../policies/admin-authorization.policy';
import {
  deleteAdminAdminRow,
  getAdminAdminGuardRow,
  updateAdminAdminStatus,
} from '../repositories/admin-admins.repository';
import {
  adminAdminCreateSchema,
  adminAdminIdSchema,
  adminAdminStatusChangeSchema,
} from '../schemas/admin-admins.schema';
import { createManagedAdmin } from '../services/admin-admin-management.service';
import { recordAdminAuditEvent } from '../services/admin-audit.service';
import { requireAdmin } from '../services/admin-session.service';
import type { AdminAdminActionState } from '../types/admin-admins-view.types';

/**
 * Create a new admin or moderator. `role` is already restricted to
 * `'ADMIN' | 'MODERATOR'` by `adminAdminCreateSchema` — `SUPER_ADMIN` can
 * never reach `createManagedAdmin`, seeding remains the only way that role is
 * ever assigned. Every field on the schema carries its own message key, so a
 * parse failure's first issue is always a translatable string, never zod's
 * own default English sentence.
 */
export async function createAdminAdminAction(
  _previous: AdminAdminActionState,
  formData: FormData,
): Promise<AdminAdminActionState> {
  const admin = await requireAdmin('ADMINS_MANAGE');
  const parsed = parseSchema(adminAdminCreateSchema, {
    name: formData.get(ADMIN_ADMIN_FIELD_NAMES.name),
    email: formData.get(ADMIN_ADMIN_FIELD_NAMES.email),
    role: formData.get(ADMIN_ADMIN_FIELD_NAMES.role),
    password: formData.get(ADMIN_ADMIN_FIELD_NAMES.password),
  });

  if (!parsed.ok) {
    return {
      status: 'error',
      message: parsed.issues[0]?.message ?? ADMIN_ADMIN_ACTION_MESSAGE_KEYS.invalid,
    };
  }

  const result = await createManagedAdmin(parsed.value);

  if (!result.ok) {
    return { status: 'error', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.duplicateEmail };
  }

  await recordAdminAuditEvent({
    adminUserId: admin.id,
    targetType: 'ADMIN_USER',
    targetId: result.id,
    action: 'admin.admin.created',
    metadata: { role: parsed.value.role, email: parsed.value.email },
  });

  invalidatePath(ROUTE_PATHS.managawyAdmins);

  return { status: 'success', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.created };
}

/**
 * Suspend or reactivate one admin.
 *
 * THE CRITICAL INVARIANT lives here, not in the UI: `assertNotSuperAdmin`
 * runs on the *target* row, fetched fresh from the database — never trusted
 * from the request — before any write, for both directions. Suspending also
 * runs `assertNotSelfTarget`, so the caller can never lock themselves out.
 * `ADMINS_MANAGE` grants managing admins in general; it overrides neither
 * guard, including for the admin who holds it.
 */
export async function setAdminAdminStatusAction(
  _previous: AdminAdminActionState,
  formData: FormData,
): Promise<AdminAdminActionState> {
  const admin = await requireAdmin('ADMINS_MANAGE');
  const parsed = parseSchema(adminAdminStatusChangeSchema, {
    adminId: formData.get(ADMIN_ADMIN_FIELD_NAMES.adminId),
    status: formData.get(ADMIN_ADMIN_FIELD_NAMES.status),
  });

  if (!parsed.ok) {
    return { status: 'error', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.invalid };
  }

  const target = await getAdminAdminGuardRow(parsed.value.adminId);

  if (target === null) {
    return { status: 'error', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.notFound };
  }

  try {
    assertNotSuperAdmin(target);
  } catch {
    return { status: 'error', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.protected };
  }

  if (parsed.value.status === 'SUSPENDED') {
    try {
      assertNotSelfTarget(admin.id, target.id);
    } catch {
      return { status: 'error', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.selfLockout };
    }
  }

  const updated = await updateAdminAdminStatus(target.id, parsed.value.status);

  if (!updated) {
    return { status: 'error', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.notFound };
  }

  await recordAdminAuditEvent({
    adminUserId: admin.id,
    targetType: 'ADMIN_USER',
    targetId: target.id,
    action: parsed.value.status === 'SUSPENDED' ? 'admin.admin.suspended' : 'admin.admin.activated',
  });

  invalidatePath(ROUTE_PATHS.managawyAdmins);

  return {
    status: 'success',
    message:
      parsed.value.status === 'SUSPENDED'
        ? ADMIN_ADMIN_ACTION_MESSAGE_KEYS.suspended
        : ADMIN_ADMIN_ACTION_MESSAGE_KEYS.activated,
  };
}

/**
 * Delete one admin. Both guards run unconditionally — there is no direction
 * on a delete for `assertNotSelfTarget` to be selective about, unlike the
 * status action above.
 */
export async function deleteAdminAdminAction(
  _previous: AdminAdminActionState,
  formData: FormData,
): Promise<AdminAdminActionState> {
  const admin = await requireAdmin('ADMINS_MANAGE');
  const parsed = parseSchema(adminAdminIdSchema, {
    adminId: formData.get(ADMIN_ADMIN_FIELD_NAMES.adminId),
  });

  if (!parsed.ok) {
    return { status: 'error', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.invalid };
  }

  const target = await getAdminAdminGuardRow(parsed.value.adminId);

  if (target === null) {
    return { status: 'error', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.notFound };
  }

  try {
    assertNotSuperAdmin(target);
  } catch {
    return { status: 'error', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.protected };
  }

  try {
    assertNotSelfTarget(admin.id, target.id);
  } catch {
    return { status: 'error', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.selfLockout };
  }

  const deleted = await deleteAdminAdminRow(target.id);

  if (!deleted) {
    return { status: 'error', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.notFound };
  }

  await recordAdminAuditEvent({
    adminUserId: admin.id,
    targetType: 'ADMIN_USER',
    targetId: target.id,
    action: 'admin.admin.deleted',
  });

  invalidatePath(ROUTE_PATHS.managawyAdmins);

  return { status: 'success', message: ADMIN_ADMIN_ACTION_MESSAGE_KEYS.deleted };
}
