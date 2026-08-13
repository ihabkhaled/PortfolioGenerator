import type { AdminAuditTargetType } from './admin.types';

/**
 * The database projection the audit log repository returns.
 *
 * Declared structurally rather than importing Prisma's generated model type,
 * mirroring `AdminPortfolioRow`: `targetType` is plain `string` here and cast
 * to the narrow union at the mapper boundary, `metadata` is `unknown` — the
 * same convention every JSON column takes across the codebase (see
 * `PortfolioRow.draftDocument`) — and `adminName`/`adminEmail` are the joined
 * columns this admin-only projection adds so the list reads "who", not just
 * an id.
 */
export interface AdminAuditEventRow {
  readonly id: string;
  readonly adminUserId: string;
  readonly adminName: string;
  readonly adminEmail: string;
  readonly targetType: string;
  readonly targetId: string;
  readonly action: string;
  readonly metadata: unknown;
  readonly createdAt: Date;
}

/** One audit event, as the audit log screen sees it — the row's `targetType` narrowed to its real union. */
export interface AdminAuditEventSummary {
  readonly id: string;
  readonly adminUserId: string;
  readonly adminName: string;
  readonly adminEmail: string;
  readonly targetType: AdminAuditTargetType;
  readonly targetId: string;
  readonly action: string;
  readonly metadata: unknown;
  readonly createdAt: Date;
}

/** Narrows the list to one target type, or lifts the restriction entirely. */
export type AdminAuditLogTargetTypeFilter = 'ALL' | AdminAuditTargetType;

/**
 * A resolved filter state, independent of how it arrived (query string,
 * a form submit) — the one shape `buildAdminAuditLogListHref` and the
 * repository's `where` builder both consume.
 */
export interface AdminAuditLogFilterState {
  readonly query: string;
  readonly adminUserId: string | undefined;
  readonly targetType: AdminAuditLogTargetTypeFilter;
  readonly action: string | undefined;
}

export interface AdminAuditLogSearchParams extends AdminAuditLogFilterState {
  readonly offset: number;
  readonly limit: number;
}

export interface AdminAuditLogListResult {
  readonly rows: readonly AdminAuditEventRow[];
  readonly totalCount: number;
}

/** One acting admin, as the "filter by admin" dropdown needs it. */
export interface AdminAuditLogAdminOption {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

/**
 * What the filters form can offer, grounded in the events that actually
 * exist — every admin and every action code that appears in at least one
 * row, rather than the full admin roster or a hardcoded action list that
 * could drift from what was ever really recorded.
 */
export interface AdminAuditLogFilterOptions {
  readonly admins: readonly AdminAuditLogAdminOption[];
  readonly actions: readonly string[];
}
