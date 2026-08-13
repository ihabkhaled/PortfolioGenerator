/**
 * The database projection the admin portfolio repository returns.
 *
 * Declared structurally rather than importing Prisma's generated model type,
 * mirroring `PortfolioRow` in `src/modules/portfolios/types/portfolio-row.types.ts`:
 * `status` is plain `string` here and cast to the narrow union at the mapper
 * boundary, and `ownerEmail` is the one column this admin-only projection adds
 * that the owner-scoped repository never selects.
 */
export interface AdminPortfolioRow {
  readonly id: string;
  readonly slug: string;
  readonly status: string;
  readonly ownerId: string;
  readonly ownerEmail: string;
  readonly suspendedAt: Date | null;
  readonly updatedAt: Date;
}

export type AdminPortfolioStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';

/** Narrows the list to one lifecycle state, or to suspended regardless of state. */
export type AdminPortfolioStatusFilter = 'ALL' | AdminPortfolioStatus | 'SUSPENDED';

/** A portfolio as moderation sees it: identity and lifecycle, never document content. */
export interface AdminPortfolioSummary {
  readonly id: string;
  readonly slug: string;
  readonly ownerId: string;
  readonly ownerEmail: string;
  readonly status: AdminPortfolioStatus;
  readonly isSuspended: boolean;
  readonly updatedAt: Date;
}

export interface AdminPortfolioSearchParams {
  readonly query: string;
  readonly status: AdminPortfolioStatusFilter;
  readonly offset: number;
  readonly limit: number;
}

export interface AdminPortfolioListResult {
  readonly rows: readonly AdminPortfolioRow[];
  readonly totalCount: number;
}

export interface AdminPortfolioActionState {
  readonly status: 'idle' | 'error' | 'success';
  /** An i18n message key, resolved by whichever client container calls the action. */
  readonly error: string | null;
}
