import type { AdminPermission, AuthenticatedAdmin } from './admin.types';

/**
 * A page of admin accounts eligible for RBAC editing, plus everything the
 * pager and the "showing X-Y of Z" summary need — mirrors `AdminUserSearchResult`
 * in `admin-users.types.ts`, built from the same `pagination.helper.ts` maths.
 *
 * The super admin never appears here: `searchAdminUsersForRbac` excludes it
 * at the query level, since this screen refuses to open it regardless.
 */
export interface AdminRbacSearchResult {
  readonly admins: readonly AuthenticatedAdmin[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly skip: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
}

/**
 * What changed between an admin's previous and next permission set — the
 * shape the save action hands to the audit entry. `changed` is `false` only
 * when the submitted set is identical to what was already stored, which the
 * action treats as a distinct, non-alarming outcome rather than a no-op error.
 */
export interface AdminPermissionDiff {
  readonly added: readonly AdminPermission[];
  readonly removed: readonly AdminPermission[];
  readonly changed: boolean;
}
