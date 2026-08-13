import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

import type { AdminNavItem } from '../types/admin-shell-view.types';

/** The brand mark in the `/managawy` nav rail. */
export const ADMIN_SHELL_BRAND_LABEL = 'ProFolio Admin';

/** `aria-label` on the nav landmark itself. */
export const ADMIN_SHELL_NAV_ARIA_LABEL = 'Admin';

/**
 * Only `Dashboard` carries a real `href` — the rest are visible-but-disabled
 * placeholders for the Phase 2 management screens (see spec).
 */
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: ROUTE_PATHS.managawy },
  { id: 'users', label: 'Users', href: null },
  { id: 'portfolios', label: 'Portfolios', href: null },
  { id: 'admins', label: 'Admins', href: null },
  { id: 'rbac', label: 'RBAC', href: null },
  { id: 'audit-log', label: 'Audit Log', href: null },
];
