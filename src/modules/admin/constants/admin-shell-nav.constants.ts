import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import type { AdminNavItem } from '../types/admin-shell-view.types';

/** The brand mark in the `/managawy` nav rail. */
export const ADMIN_SHELL_BRAND_LABEL = 'ProFolio Admin';

/** `aria-label` on the nav landmark itself. */
export const ADMIN_SHELL_NAV_ARIA_LABEL = 'Admin';

/**
 * Every `/managawy` management screen, wired to its real route.
 *
 * `href` stays nullable on the type — see `AdminNavItem` — so a future item
 * a given admin cannot reach yet can still render disabled rather than as a
 * dead link, but Phase 2 shipped all six destinations, so nothing here is
 * `null` any more.
 */
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: ROUTE_PATHS.managawy },
  { id: 'users', label: 'Users', href: ROUTE_PATHS.managawyUsers },
  { id: 'portfolios', label: 'Portfolios', href: ROUTE_PATHS.managawyPortfolios },
  { id: 'admins', label: 'Admins', href: ROUTE_PATHS.managawyAdmins },
  { id: 'rbac', label: 'RBAC', href: ROUTE_PATHS.managawyRbac },
  { id: 'audit-log', label: 'Audit Log', href: ROUTE_PATHS.managawyAuditLog },
];
