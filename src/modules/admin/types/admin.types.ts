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

/**
 * Who did what to whom, as opposed to `AuditEventType`'s "whose data
 * changed" — declared as a plain string-literal union rather than imported
 * from `@prisma/client`, for the same reason `AdminRole` above is.
 */
export type AdminAuditTargetType = 'USER' | 'PORTFOLIO' | 'ADMIN_USER';

/**
 * Bounded metadata, matching `AuditMetadata`'s convention exactly: scalars
 * only, never CV text, never a password or TOTP secret.
 */
export type AdminAuditMetadata = Readonly<Record<string, string | number | boolean | null>>;

export interface AdminAuditEventInput {
  readonly adminUserId: string;
  readonly targetType: AdminAuditTargetType;
  readonly targetId: string;
  readonly action: string;
  readonly metadata?: AdminAuditMetadata;
}

/** The sink an admin audit event is written to. */
export interface AdminAuditSink {
  record: (event: AdminAuditEventInput) => Promise<void>;
}

/**
 * The database projection `toAuthenticatedAdmin` accepts.
 *
 * Declared structurally rather than importing Prisma's generated `AdminUser`
 * model type: `@prisma/client` is confined to `src/packages/database/`, and
 * enum-like fields are typed as plain `string` here, cast to their narrow
 * union at the mapper boundary — the same convention `PortfolioRow` follows
 * in `src/modules/portfolios/types/portfolio-row.types.ts`.
 */
export interface AdminUserRow {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: string;
  readonly permissions: readonly string[];
  readonly isSuperAdmin: boolean;
  readonly status: string;
}
