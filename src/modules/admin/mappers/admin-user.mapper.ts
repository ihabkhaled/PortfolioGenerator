import type {
  AdminUserDetailRow,
  AdminUserListRow,
  AdminUserPortfolioRow,
} from '../types/admin-user-row.types';
import type {
  AdminManagedUser,
  AdminManagedUserDetail,
  AdminManagedUserPortfolio,
} from '../types/admin-users.types';
import type { AdminPortfolioStatus, AdminUserStatus } from '../types/admin.types';

export function toAdminManagedUser(row: AdminUserListRow): AdminManagedUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    status: row.status as AdminUserStatus,
    portfolioCount: row.portfolioCount,
    createdAt: row.createdAt,
  };
}

export function toAdminManagedUserDetail(row: AdminUserDetailRow): AdminManagedUserDetail {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    status: row.status as AdminUserStatus,
    createdAt: row.createdAt,
  };
}

export function toAdminManagedUserPortfolio(row: AdminUserPortfolioRow): AdminManagedUserPortfolio {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status as AdminPortfolioStatus,
    isSuspended: row.suspendedAt !== null,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
  };
}
