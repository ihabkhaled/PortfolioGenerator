/**
 * Declared structurally rather than importing Prisma's generated enum types:
 * `@prisma/client` is confined to `src/packages/database/` (see
 * context/package-boundaries.md), and mirroring the literal values here keeps
 * this module unit-testable with plain object fixtures — the same convention
 * `PortfolioStatus` follows in `src/modules/portfolios/types/portfolio.types.ts`.
 */
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';

export type AdminPermission =
  | 'USERS_VIEW'
  | 'USERS_SUSPEND'
  | 'USERS_RESET_PASSWORD'
  | 'PORTFOLIOS_VIEW'
  | 'PORTFOLIOS_SUSPEND'
  | 'PORTFOLIOS_DELETE'
  | 'PAGES_MODERATE'
  | 'ADMINS_MANAGE'
  | 'RBAC_MANAGE'
  | 'AUDIT_VIEW';

export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED';

/**
 * Deliberately narrower than the Prisma row, mirroring `AuthenticatedUser`
 * in the user-facing auth: everything below the action layer takes this
 * shape, never a raw session or a full database record.
 */
export interface AuthenticatedAdmin {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: AdminRole;
  readonly permissions: readonly AdminPermission[];
  readonly isSuperAdmin: boolean;
  readonly status: AdminUserStatus;
}

/** The shape `assertNotSuperAdmin` guards against — any target row or DTO carrying this flag. */
export interface SuperAdminGuardTarget {
  readonly isSuperAdmin: boolean;
}
