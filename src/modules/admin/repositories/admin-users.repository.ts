import 'server-only';

import { getDatabase } from '@/packages/database';

import { ADMIN_USERS_PAGE_SIZE } from '../constants/admin-users.constants';
import { clampPage, computeOffset, computePageCount } from '../helpers/pagination.helper';
import {
  toAdminManagedUser,
  toAdminManagedUserDetail,
  toAdminManagedUserPortfolio,
} from '../mappers/admin-user.mapper';
import type {
  AdminManagedUserDetail,
  AdminManagedUserPortfolio,
  AdminUserSearchResult,
} from '../types/admin-users.types';

/**
 * Read-only cross-tenant access for the users-management screen — the same
 * sanctioned exception `admin-stats.repository.ts` documents: an admin's job
 * is looking at other people's accounts, so there is no owner to scope these
 * queries to. Every write here still goes through `setUserAccountStatus` in
 * `src/modules/auth/server.ts`, which is the one place `User.status` is
 * mutated regardless of caller.
 */

/**
 * Case-insensitive contains on name or email, offset-paginated. The count
 * query runs first so the page requested against a query that has since
 * shrunk (a search narrowed, a user was deleted) still clamps to a real page
 * rather than asking Prisma for a negative or wildly out-of-range offset.
 */
export async function searchAdminUsers(
  query: string,
  requestedPage: number,
): Promise<AdminUserSearchResult> {
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

  const totalCount = await getDatabase().user.count({ where });
  const totalPages = computePageCount(totalCount, ADMIN_USERS_PAGE_SIZE);
  const page = clampPage(requestedPage, totalPages);
  const skip = computeOffset(page, ADMIN_USERS_PAGE_SIZE);

  const rows = await getDatabase().user.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: ADMIN_USERS_PAGE_SIZE,
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      status: true,
      createdAt: true,
      // Soft-deleted portfolios are not "theirs" for this count — a user who
      // deleted every portfolio should read as having none, not as still
      // owning rows that no longer appear anywhere else in the product.
      _count: { select: { portfolios: { where: { deletedAt: null } } } },
    },
  });

  const users = rows.map((row) =>
    toAdminManagedUser({
      id: row.id,
      name: row.name,
      email: row.email,
      emailVerified: row.emailVerified,
      status: row.status,
      createdAt: row.createdAt,
      portfolioCount: row._count.portfolios,
    }),
  );

  return {
    users,
    page,
    pageSize: ADMIN_USERS_PAGE_SIZE,
    totalCount,
    totalPages,
    skip,
    hasPrevious: page > 1,
    hasNext: page < totalPages,
  };
}

export async function getAdminUserDetail(userId: string): Promise<AdminManagedUserDetail | null> {
  const row = await getDatabase().user.findFirst({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      status: true,
      createdAt: true,
    },
  });

  return row === null ? null : toAdminManagedUserDetail(row);
}

/** Every non-deleted portfolio a user owns, newest edit first — what the user's detail page lists. */
export async function listAdminUserPortfolios(
  userId: string,
): Promise<readonly AdminManagedUserPortfolio[]> {
  const rows = await getDatabase().portfolio.findMany({
    where: { ownerId: userId, deletedAt: null },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      status: true,
      publishedAt: true,
      suspendedAt: true,
      updatedAt: true,
    },
  });

  return rows.map((row) => toAdminManagedUserPortfolio(row));
}
