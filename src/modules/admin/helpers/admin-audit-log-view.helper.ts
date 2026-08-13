import type { TranslateFunction } from '@/packages/i18n';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import {
  ADMIN_AUDIT_LOG_ALL_VALUE,
  ADMIN_AUDIT_LOG_QUERY_MAX_LENGTH,
  ADMIN_AUDIT_LOG_QUERY_PARAMS,
  ADMIN_AUDIT_LOG_TARGET_TYPE_FILTERS,
  ADMIN_AUDIT_LOG_TARGET_TYPE_MESSAGE_KEYS,
} from '../constants/admin-audit-log.constants';
import { PAGINATION_FIRST_PAGE } from '../constants/pagination.constants';
import type {
  AdminAuditLogFilterOption,
  AdminAuditLogMetadataEntryView,
  AdminAuditLogRowView,
} from '../types/admin-audit-log-view.types';
import type {
  AdminAuditEventSummary,
  AdminAuditLogAdminOption,
  AdminAuditLogFilterState,
  AdminAuditLogTargetTypeFilter,
} from '../types/admin-audit-log.types';

import { resolveAdminAuditActionLabel } from './admin-audit-action.helper';
import { buildAdminUserDetailPath } from './admin-users-path.helper';

/** True when a raw string is one of the known target-type-filter values. */
export function isAdminAuditLogTargetTypeFilter(
  value: string,
): value is AdminAuditLogTargetTypeFilter {
  return (ADMIN_AUDIT_LOG_TARGET_TYPE_FILTERS as readonly string[]).includes(value);
}

/** A raw `targetType` query-string value to a safe filter, defaulting to 'ALL'. */
export function parseAdminAuditLogTargetTypeFilter(
  value: string | undefined,
): AdminAuditLogTargetTypeFilter {
  return value !== undefined && isAdminAuditLogTargetTypeFilter(value) ? value : 'ALL';
}

/** A raw `q` query-string value to a trimmed, length-bounded target-id search term. */
export function sanitizeAdminAuditLogQuery(value: string | undefined): string {
  return value === undefined ? '' : value.trim().slice(0, ADMIN_AUDIT_LOG_QUERY_MAX_LENGTH);
}

/**
 * A raw `admin` or `action` query-string value to an active filter, or
 * `undefined` when the field carries the "all" sentinel or nothing at all —
 * unlike the target-type filter, both of these are plain-string columns, so
 * there is no fixed set of legal values to validate against: a stale or
 * tampered id simply matches zero rows.
 */
export function sanitizeAdminAuditLogFilterValue(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim().slice(0, ADMIN_AUDIT_LOG_QUERY_MAX_LENGTH);

  return trimmed === '' || trimmed === ADMIN_AUDIT_LOG_ALL_VALUE ? undefined : trimmed;
}

/**
 * A search/filter/page combination to the audit log's URL.
 *
 * Omits every parameter at its default (empty search, no admin/action
 * filter, 'ALL' target type, page one) so a plain visit and a "reset" both
 * land on the same clean URL rather than one cluttered with query params.
 */
export function buildAdminAuditLogListHref(
  filters: AdminAuditLogFilterState,
  page: number,
): string {
  const search = new URLSearchParams();
  const trimmedQuery = filters.query.trim();

  if (trimmedQuery !== '') {
    search.set(ADMIN_AUDIT_LOG_QUERY_PARAMS.query, trimmedQuery);
  }

  if (filters.adminUserId !== undefined) {
    search.set(ADMIN_AUDIT_LOG_QUERY_PARAMS.admin, filters.adminUserId);
  }

  if (filters.targetType !== 'ALL') {
    search.set(ADMIN_AUDIT_LOG_QUERY_PARAMS.targetType, filters.targetType);
  }

  if (filters.action !== undefined) {
    search.set(ADMIN_AUDIT_LOG_QUERY_PARAMS.action, filters.action);
  }

  if (page > PAGINATION_FIRST_PAGE) {
    search.set(ADMIN_AUDIT_LOG_QUERY_PARAMS.page, String(page));
  }

  const queryString = search.toString();

  return queryString === ''
    ? ROUTE_PATHS.managawyAuditLog
    : `${ROUTE_PATHS.managawyAuditLog}?${queryString}`;
}

/** The target-type filter's options for the `<select>`, in the fixed, reviewed order. */
export function buildAdminAuditLogTargetTypeOptions(
  translate: TranslateFunction,
): readonly AdminAuditLogFilterOption[] {
  return ADMIN_AUDIT_LOG_TARGET_TYPE_FILTERS.map((filter) => ({
    value: filter,
    label: translate(ADMIN_AUDIT_LOG_TARGET_TYPE_MESSAGE_KEYS[filter]),
  }));
}

/** The acting-admin filter's options: "all admins" plus every admin who has recorded an event. */
export function buildAdminAuditLogAdminOptions(
  admins: readonly AdminAuditLogAdminOption[],
  translate: TranslateFunction,
): readonly AdminAuditLogFilterOption[] {
  return [
    { value: ADMIN_AUDIT_LOG_ALL_VALUE, label: translate('auditLog.filters.allAdmins') },
    ...admins.map((admin) => ({ value: admin.id, label: `${admin.name} (${admin.email})` })),
  ];
}

/** The action filter's options: "all actions" plus every code that has ever been recorded, humanized. */
export function buildAdminAuditLogActionOptions(
  actions: readonly string[],
  translate: TranslateFunction,
): readonly AdminAuditLogFilterOption[] {
  return [
    { value: ADMIN_AUDIT_LOG_ALL_VALUE, label: translate('auditLog.filters.allActions') },
    ...actions.map((action) => ({
      value: action,
      label: resolveAdminAuditActionLabel(action, translate),
    })),
  ];
}

/** One JSON metadata scalar, rendered as plain text rather than as a JSON token. */
export function formatAdminAuditMetadataValue(value: unknown): string {
  if (value === null) {
    return 'null';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return JSON.stringify(value);
}

/**
 * A stored metadata payload to a readable `key: value` list.
 *
 * `AdminAuditMetadata` is always a flat scalar record in practice — every
 * `recordAdminAuditEvent` call site writes one — but the column is read back
 * as untyped JSON, so a non-object payload (or `null`) is treated as "no
 * metadata" rather than crashing the row.
 */
export function buildAdminAuditMetadataEntries(
  metadata: unknown,
): readonly AdminAuditLogMetadataEntryView[] {
  if (metadata === null || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return [];
  }

  return Object.entries(metadata as Record<string, unknown>).map(([key, value]) => ({
    key,
    value: formatAdminAuditMetadataValue(value),
  }));
}

/** `YYYY-MM-DD HH:mm` UTC, stable across server and client so hydration cannot mismatch. */
export function formatAdminAuditLogTimestamp(value: Date): string {
  return value.toISOString().slice(0, 16).replace('T', ' ');
}

/** Where a target's own admin detail screen lives, or `null` when this target type has none. */
export function buildAdminAuditTargetHref(
  targetType: AdminAuditEventSummary['targetType'],
  targetId: string,
): string | null {
  return targetType === 'USER' ? buildAdminUserDetailPath(targetId) : null;
}

/**
 * An audit event to its table-row view: every label, code and link the
 * presentational table needs, computed once here rather than inside the
 * (hook-free, logic-free) component.
 */
export function buildAdminAuditLogRowView(
  summary: AdminAuditEventSummary,
  translate: TranslateFunction,
): AdminAuditLogRowView {
  return {
    id: summary.id,
    whenLabel: formatAdminAuditLogTimestamp(summary.createdAt),
    whenIso: summary.createdAt.toISOString(),
    adminLabel: `${summary.adminName} (${summary.adminEmail})`,
    actionLabel: resolveAdminAuditActionLabel(summary.action, translate),
    actionCode: summary.action,
    targetTypeLabel: translate(ADMIN_AUDIT_LOG_TARGET_TYPE_MESSAGE_KEYS[summary.targetType]),
    targetId: summary.targetId,
    targetHref: buildAdminAuditTargetHref(summary.targetType, summary.targetId),
    metadataEntries: buildAdminAuditMetadataEntries(summary.metadata),
  };
}
