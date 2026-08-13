import type { AdminPermission, AdminRole } from '../types/admin.types';

/**
 * What each role can do the moment it is created. Purely code — not a
 * database table — because these are the defaults, code-reviewed policy;
 * the Phase 3 RBAC page overwrites `AdminUser.permissions` per admin, it
 * never edits this map.
 */
export const DEFAULT_ROLE_PERMISSIONS: Readonly<Record<AdminRole, readonly AdminPermission[]>> = {
  SUPER_ADMIN: [
    'USERS_VIEW',
    'USERS_SUSPEND',
    'USERS_RESET_PASSWORD',
    'PORTFOLIOS_VIEW',
    'PORTFOLIOS_SUSPEND',
    'PORTFOLIOS_DELETE',
    'PAGES_MODERATE',
    'ADMINS_MANAGE',
    'RBAC_MANAGE',
    'AUDIT_VIEW',
  ],
  ADMIN: [
    'USERS_VIEW',
    'USERS_SUSPEND',
    'USERS_RESET_PASSWORD',
    'PORTFOLIOS_VIEW',
    'PORTFOLIOS_SUSPEND',
    'PORTFOLIOS_DELETE',
    'PAGES_MODERATE',
    'ADMINS_MANAGE',
    'RBAC_MANAGE',
    'AUDIT_VIEW',
  ],
  MODERATOR: [
    'USERS_VIEW',
    'USERS_SUSPEND',
    'USERS_RESET_PASSWORD',
    'PORTFOLIOS_VIEW',
    'PORTFOLIOS_SUSPEND',
    'PAGES_MODERATE',
  ],
} as const;
