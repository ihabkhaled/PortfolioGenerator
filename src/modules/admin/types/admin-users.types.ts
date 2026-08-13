import type { AdminPortfolioStatus, AdminUserStatus } from './admin.types';

/** A platform user as the admin users list and detail screens see them. */
export interface AdminManagedUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly status: AdminUserStatus;
  readonly portfolioCount: number;
  readonly createdAt: Date;
}

export interface AdminManagedUserDetail {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly status: AdminUserStatus;
  readonly createdAt: Date;
}

export interface AdminManagedUserPortfolio {
  readonly id: string;
  readonly slug: string;
  readonly status: AdminPortfolioStatus;
  readonly isSuspended: boolean;
  readonly publishedAt: Date | null;
  readonly updatedAt: Date;
}

/**
 * A page of the users list, plus everything the pager and the "showing X-Y
 * of Z" summary need. Built from the shared `pagination.helper.ts` maths
 * (see `admin-users.repository.ts`) rather than carrying its own page-info
 * type, so there is exactly one implementation of page-count/offset
 * arithmetic across every `/managawy` list screen.
 */
export interface AdminUserSearchResult {
  readonly users: readonly AdminManagedUser[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly skip: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
}
