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
export { buildAdminNavItemViews } from './helpers/admin-nav.helper';
export { getAdminDashboardStats } from './repositories/admin-stats.repository';
export {
  getAdminPortfolioOwnerId,
  listAdminPortfolios,
} from './repositories/admin-portfolio.repository';
export { toAdminPortfolioSummary } from './mappers/admin-portfolio.mapper';
export { buildPagination, computeOffset, parsePageParam } from './helpers/pagination.helper';
export {
  buildAdminPortfolioListHref,
  buildAdminPortfolioRowViewData,
  buildAdminPortfolioStatusOptions,
  parseAdminPortfolioStatusFilter,
  sanitizeAdminPortfolioQuery,
} from './helpers/admin-portfolio-view.helper';
export {
  ADMIN_PORTFOLIO_PAGE_SIZE,
  ADMIN_PORTFOLIO_QUERY_PARAMS,
} from './constants/admin-portfolio.constants';
export { adminPortfolioClasses } from './constants/admin-portfolio-style.constants';
export {
  getAdminUserDetail,
  listAdminUserPortfolios,
  searchAdminUsers,
} from './repositories/admin-users.repository';
export {
  setManagedUserAccountStatus,
  sendManagedUserPasswordReset,
} from './services/admin-user-management.service';
export {
  buildAdminUserDetailPath,
  buildAdminPortfoliosSearchPath,
  buildAdminUsersListPath,
} from './helpers/admin-users-path.helper';
export {
  buildAdminUserPortfolioRowViews,
  buildAdminUserProfileFieldsView,
  buildAdminUserRowViews,
  buildAdminUsersPaginationView,
  buildAdminUsersResultCountLabel,
} from './helpers/admin-users-view.helper';
export {
  ADMIN_USERS_PAGE_PARAM,
  ADMIN_USERS_PAGE_SIZE,
  ADMIN_USERS_QUERY_PARAM,
} from './constants/admin-users.constants';
export { adminUsersClasses } from './constants/admin-users-style.constants';
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
export type { AdminManagedUserDetail, AdminUserSearchResult } from './types/admin-users.types';
