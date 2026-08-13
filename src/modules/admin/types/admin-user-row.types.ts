/**
 * Database projections the admin-users mappers accept.
 *
 * Declared structurally rather than importing Prisma's generated model types:
 * `@prisma/client` is confined to `src/packages/database/`, and enum-like
 * fields are typed as plain `string` here, cast to their narrow union at the
 * mapper boundary — the same convention `PortfolioRow` follows in
 * `src/modules/portfolios/types/portfolio-row.types.ts`.
 */

export interface AdminUserListRow {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly status: string;
  readonly createdAt: Date;
  /** Non-deleted portfolios only — a soft-deleted row is not "theirs" any more. */
  readonly portfolioCount: number;
}

export interface AdminUserDetailRow {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly emailVerified: boolean;
  readonly status: string;
  readonly createdAt: Date;
}

export interface AdminUserPortfolioRow {
  readonly id: string;
  readonly slug: string;
  readonly status: string;
  readonly publishedAt: Date | null;
  readonly suspendedAt: Date | null;
  readonly updatedAt: Date;
}
