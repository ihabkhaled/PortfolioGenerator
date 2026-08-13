import type {
  AdminPermission,
  AuthenticatedAdmin,
  SuperAdminGuardTarget,
} from '../types/admin.types';

/**
 * The one place "can this admin do X" is answered.
 *
 * A suspended admin has zero permissions regardless of role or the
 * super-admin flag — suspension is a full stop, not a soft warning — and a
 * super admin has every permission unconditionally, which is what makes
 * "non-touchable" meaningful: the super admin can never accidentally lock
 * themselves out by an RBAC edit that only ever touches `permissions`.
 */
export function hasAdminPermission(
  admin: AuthenticatedAdmin,
  permission: AdminPermission,
): boolean {
  if (admin.status === 'SUSPENDED') return false;
  if (admin.isSuperAdmin) return true;

  return admin.permissions.includes(permission);
}

/**
 * The non-touchable-super-admin guard. Every action that would modify,
 * suspend or delete an `AdminUser` calls this on the *target* row before
 * doing anything else, regardless of what the caller is otherwise allowed
 * to do — `ADMINS_MANAGE` grants managing admins in general, never this one.
 */
export function assertNotSuperAdmin(target: SuperAdminGuardTarget): void {
  if (target.isSuperAdmin) {
    throw new Error('The super admin account cannot be modified.');
  }
}

/**
 * The self-lockout guard. Suspending or deleting your own admin account
 * would strand the very person meant to reverse the change just as surely as
 * touching the super admin would — this is the second half of "no admin
 * mutation can make an admin unreachable", called on the *caller* alongside
 * `assertNotSuperAdmin` on the target, before either mutation runs.
 * `ADMINS_MANAGE` never overrides it, not even for the admin who holds it.
 */
export function assertNotSelfTarget(callerId: string, targetId: string): void {
  if (callerId === targetId) {
    throw new Error('You cannot perform this action on your own admin account.');
  }
}
