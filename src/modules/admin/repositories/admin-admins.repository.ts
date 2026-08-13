import 'server-only';

import { randomUUID } from 'node:crypto';

import { getDatabase } from '@/packages/database';

import { ADMIN_ADMINS_PAGE_SIZE } from '../constants/admin-admins.constants';
import { clampPage, computeOffset, computePageCount } from '../helpers/pagination.helper';
import { toAdminManagedAdmin } from '../mappers/admin-admin.mapper';
import type {
  AdminAdminCreateResult,
  AdminAdminGuardRow,
  AdminAdminInsertInput,
  AdminAdminSearchResult,
} from '../types/admin-admins.types';
import type { AdminUserStatus } from '../types/admin.types';

/**
 * `AdminUser` is this module's own table — unlike the cross-tenant reads in
 * `admin-portfolio.repository.ts` and `admin-users.repository.ts`, which
 * borrow another module's data for moderation, this repository is the actual
 * owner of the rows it reads and writes.
 */

/** Case-insensitive contains on name or email, offset-paginated — mirrors `searchAdminUsers`. */
export async function searchAdminAdmins(
  query: string,
  requestedPage: number,
): Promise<AdminAdminSearchResult> {
  const trimmedQuery = query.trim();
  const where =
    trimmedQuery === ''
      ? {}
      : {
          OR: [
            { name: { contains: trimmedQuery, mode: 'insensitive' as const } },
            { email: { contains: trimmedQuery, mode: 'insensitive' as const } },
          ],
        };

  const totalCount = await getDatabase().adminUser.count({ where });
  const totalPages = computePageCount(totalCount, ADMIN_ADMINS_PAGE_SIZE);
  const page = clampPage(requestedPage, totalPages);
  const skip = computeOffset(page, ADMIN_ADMINS_PAGE_SIZE);

  const rows = await getDatabase().adminUser.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: ADMIN_ADMINS_PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isSuperAdmin: true,
      twoFactorEnabled: true,
      createdAt: true,
    },
  });

  const admins = rows.map((row) => toAdminManagedAdmin(row));

  return {
    admins,
    page,
    pageSize: ADMIN_ADMINS_PAGE_SIZE,
    totalCount,
    totalPages,
    skip,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };
}

/**
 * The minimal row every guarded admins-management action reads before acting
 * — enough for `assertNotSuperAdmin` and `assertNotSelfTarget`, nothing more.
 * `null` when the id names no admin, which every caller treats as "not found".
 */
export async function getAdminAdminGuardRow(adminId: string): Promise<AdminAdminGuardRow | null> {
  return getDatabase().adminUser.findUnique({
    where: { id: adminId },
    select: { id: true, isSuperAdmin: true },
  });
}

/**
 * `updateMany` rather than `update`: a plain `update` throws on a missing id,
 * and the caller here treats "matched zero rows" as a normal, reportable
 * outcome rather than an exception — same contract as `setUserAccountStatus`.
 */
export async function updateAdminAdminStatus(
  adminId: string,
  status: AdminUserStatus,
): Promise<boolean> {
  const result = await getDatabase().adminUser.updateMany({
    where: { id: adminId },
    data: { status },
  });

  return result.count > 0;
}

/**
 * Deleting the `AdminUser` row cascades its `AdminAccount`, `AdminSession`,
 * `AdminTwoFactor` and `AdminAuditEvent` rows per the schema's own
 * `onDelete: Cascade` — nothing here has to clean those up separately.
 */
export async function deleteAdminAdminRow(adminId: string): Promise<boolean> {
  const result = await getDatabase().adminUser.deleteMany({ where: { id: adminId } });

  return result.count > 0;
}

function isUniqueConstraintFailure(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}

/**
 * `AdminUser` + `AdminAccount`, one transaction — mirrors
 * `support/seed-super-admin.mts` exactly, because `signUpEmail` cannot set
 * `AdminUser.role` (no default column) and would fail before this table is
 * ever reached. `passwordHash` arrives already hashed, from
 * `hashAdminPassword` in `@/packages/admin-auth/server` — this repository
 * never sees a plaintext password.
 */
export async function insertAdminAdmin(
  input: AdminAdminInsertInput,
): Promise<AdminAdminCreateResult> {
  const adminUserId = randomUUID();
  const database = getDatabase();

  try {
    await database.$transaction([
      database.adminUser.create({
        data: {
          id: adminUserId,
          name: input.name,
          email: input.email,
          emailVerified: false,
          role: input.role,
          permissions: [...input.permissions],
          isSuperAdmin: false,
          status: 'ACTIVE',
        },
      }),
      database.adminAccount.create({
        data: {
          id: randomUUID(),
          accountId: adminUserId,
          providerId: 'credential',
          adminUserId,
          password: input.passwordHash,
        },
      }),
    ]);

    return { ok: true, id: adminUserId };
  } catch (error) {
    if (isUniqueConstraintFailure(error)) {
      return { ok: false, reason: 'duplicateEmail' };
    }

    throw error;
  }
}
