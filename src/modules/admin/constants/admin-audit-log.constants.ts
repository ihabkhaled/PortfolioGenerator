import type { AdminAuditLogTargetTypeFilter } from '../types/admin-audit-log.types';

/** Rows per page. Small enough that a support investigation stays a scroll, not a scan. */
export const ADMIN_AUDIT_LOG_PAGE_SIZE = 20;

/** Query-string parameter names the list page reads and the filter form/pagination links write. */
export const ADMIN_AUDIT_LOG_QUERY_PARAMS = {
  query: 'q',
  admin: 'admin',
  targetType: 'targetType',
  action: 'action',
  page: 'page',
} as const;

/** Upper bound on a submitted target-id search term. */
export const ADMIN_AUDIT_LOG_QUERY_MAX_LENGTH = 200;

/** The select value that means "no filter" for the admin, target-type and action fields alike. */
export const ADMIN_AUDIT_LOG_ALL_VALUE = 'ALL';

export const ADMIN_AUDIT_LOG_TARGET_TYPE_FILTERS: readonly AdminAuditLogTargetTypeFilter[] = [
  'ALL',
  'USER',
  'PORTFOLIO',
  'ADMIN_USER',
];

export const ADMIN_AUDIT_LOG_TARGET_TYPE_MESSAGE_KEYS: Readonly<
  Record<AdminAuditLogTargetTypeFilter, string>
> = {
  ALL: 'auditLog.filters.allTargetTypes',
  USER: 'auditLog.targetTypes.USER',
  PORTFOLIO: 'auditLog.targetTypes.PORTFOLIO',
  ADMIN_USER: 'auditLog.targetTypes.ADMIN_USER',
};

/** The table's header-cell `scope` — HTML semantics, not copy, so it lives here rather than inline in a `.component.tsx`. */
export const ADMIN_AUDIT_LOG_TABLE_HEAD_SCOPE = 'col';
