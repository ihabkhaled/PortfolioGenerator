import 'server-only';

import { getDatabase } from '@/packages/database';

import { ADMIN_RBAC_PAGE_SIZE, ADMIN_RBAC_SELECT } from '../constants/admin-rbac.constants';
import { clampPage, computeOffset, computePageCount } from '../helpers/pagination.helper';
import { toAuthenticatedAdmin } from '../mappers/admin-user-to-authenticated-admin.mapper';
import type { AdminRbacSearchResult } from '../types/admin-rbac.types';
import type { AdminPermission, AuthenticatedAdmin } from '../types/admin.types';

/**
 * Cross-tenant reads over `AdminUser` for the RBAC screen — the same
 * sanctioned exception `admin-users.repository.ts` documents for platform
 * users: an admin managing other admins' permissions has no "owner" to scope
 * the query to.
 *
 * The super admin is excluded at the query level, not just in the UI:
 * `isSuperAdmin: false` keeps it out of both the count and the rows, so the
 * "X admins found" summary never counts an account this screen refuses to
 * open anyway.
 */
export async function searchAdminUsersForRbac(
  query: string,
  requestedPage: number,
): Promise<AdminRbacSearchResult> {
  const trimmedQuery = query.trim();
  const where = {
    isSuperAdmin: false,
    ...(trimmedQuery !== '' && {
      OR: [
        { name: { contains: trimmedQuery, mode: 'insensitive' as const } },
        { email: { contains: trimmedQuery, mode: 'insensitive' as const } },
      ],
    }),
  };

  const totalCount = await getDatabase().adminUser.count({ where });
  const totalPages = computePageCount(totalCount, ADMIN_RBAC_PAGE_SIZE);
  const page = clampPage(requestedPage, totalPages);
  const skip = computeOffset(page, ADMIN_RBAC_PAGE_SIZE);

  const rows = await getDatabase().adminUser.findMany({
    where,
    orderBy: { name: 'asc' },
    skip,
    take: ADMIN_RBAC_PAGE_SIZE,
    select: ADMIN_RBAC_SELECT,
  });

  return {
    admins: rows.map((row) => toAuthenticatedAdmin(row)),
    page,
    pageSize: ADMIN_RBAC_PAGE_SIZE,
    totalCount,
    totalPages,
    skip,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };
}

/**
 * One admin, by id — for the editor's initial checkbox state and for the
 * save action's before/after diff. Deliberately does *not* exclude the super
 * admin the way the search above does: the save action needs to see and
 * reject that row through `assertNotSuperAdmin`, rather than have it look
 * like "no such admin" for a caller who reached this id directly.
 */
export async function getAdminUserForRbac(adminId: string): Promise<AuthenticatedAdmin | null> {
  const row = await getDatabase().adminUser.findUnique({
    where: { id: adminId },
    select: ADMIN_RBAC_SELECT,
  });

  return row === null ? null : toAuthenticatedAdmin(row);
}

/**
 * Overwrites `AdminUser.permissions` wholesale — the documented Phase 3
 * design: a save always replaces the stored array, it never merges the
 * submission into what was already there.
 */
export async function writeAdminUserPermissions(
  adminId: string,
  permissions: readonly AdminPermission[],
): Promise<void> {
  await getDatabase().adminUser.update({
    where: { id: adminId },
    data: { permissions: [...permissions] },
  });
}
