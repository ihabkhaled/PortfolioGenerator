import type { AdminPermissionDiff } from '../types/admin-rbac.types';
import type { AdminAuditMetadata, AdminPermission } from '../types/admin.types';

/**
 * What changed between an admin's stored permissions and the set a save
 * submits — the save action's own audit entry, never a diff against
 * `DEFAULT_ROLE_PERMISSIONS`, which is unrelated code-defined policy.
 */
export function diffAdminPermissions(
  previous: readonly AdminPermission[],
  next: readonly AdminPermission[],
): AdminPermissionDiff {
  const previousSet = new Set(previous);
  const nextSet = new Set(next);
  const added = next.filter((permission) => !previousSet.has(permission));
  const removed = previous.filter((permission) => !nextSet.has(permission));

  return { added, removed, changed: added.length > 0 || removed.length > 0 };
}

/**
 * A diff to the flat scalar shape `AdminAuditMetadata` requires — the audit
 * table has no array column, so `added`/`removed` are joined into a single
 * readable string rather than dropped, and the counts stay alongside them
 * for a reader who wants the number without parsing the list.
 */
export function buildAdminPermissionDiffMetadata(diff: AdminPermissionDiff): AdminAuditMetadata {
  return {
    added: diff.added.join(', '),
    removed: diff.removed.join(', '),
    addedCount: diff.added.length,
    removedCount: diff.removed.length,
    changed: diff.changed,
  };
}

/**
 * The one case the save action refuses outright: an admin submitting a
 * permission set for their own account that drops `RBAC_MANAGE`. Checked
 * against the submitted set, not the diff, since the question is only ever
 * "does the admin still hold this permission after saving" — not what
 * changed to get there.
 */
export function isAdminRbacSelfLockout(
  callerId: string,
  targetId: string,
  nextPermissions: readonly AdminPermission[],
): boolean {
  return callerId === targetId && !nextPermissions.includes('RBAC_MANAGE');
}
