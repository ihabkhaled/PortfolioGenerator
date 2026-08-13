import 'server-only';

/** Server-only surface for the admin module. */

export {
  getOptionalAdmin,
  getOptionalAdminSession,
  requireAdmin,
} from './services/admin-session.service';
export {
  getAdminAuditSink,
  recordAdminAuditEvent,
  setAdminAuditSink,
} from './services/admin-audit.service';
export { hasAdminPermission, assertNotSuperAdmin } from './policies/admin-authorization.policy';
export { DEFAULT_ROLE_PERMISSIONS } from './constants/admin-permission.constants';
export { adminShellClasses } from './constants/admin-shell-style.constants';
export {
  ADMIN_NAV_ITEMS,
  ADMIN_SHELL_BRAND_LABEL,
  ADMIN_SHELL_NAV_ARIA_LABEL,
} from './constants/admin-shell-nav.constants';
export { buildAdminDashboardStats } from './helpers/admin-stats.helper';
export { getAdminDashboardStats } from './repositories/admin-stats.repository';
export type {
  AuthenticatedAdmin,
  AdminAuditEventInput,
  AdminAuditSink,
  AdminAuditTargetType,
  AdminAuditMetadata,
  AdminUserRow,
} from './types/admin.types';
export type { AdminDashboardStatsCounts, AdminStatTile } from './types/admin-dashboard-stats.types';
export type { AdminNavItem, AdminShellProps } from './types/admin-shell-view.types';
