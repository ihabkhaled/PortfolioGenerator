import type { AdminRbacActionState } from '../types/admin-rbac-action-view.types';
import type { AdminPermission, AdminRole } from '../types/admin.types';

/**
 * Every `AdminPermission`, in the fixed order both the reference matrix and
 * the per-admin editor render them in — declared as a literal tuple (rather
 * than `readonly AdminPermission[]`) so `adminRbacPermissionsUpdateSchema`
 * can pass it straight to `z.enum`.
 */
export const ADMIN_RBAC_PERMISSIONS_ORDER = [
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
] as const satisfies readonly AdminPermission[];

/** Every `AdminRole`, in the fixed column order the reference matrix renders. */
export const ADMIN_RBAC_ROLES_ORDER = [
  'SUPER_ADMIN',
  'ADMIN',
  'MODERATOR',
] as const satisfies readonly AdminRole[];

/**
 * Rows per page for the admin picker. Deliberately smaller than
 * `ADMIN_USERS_PAGE_SIZE`: the admin roster is small by construction (every
 * row is a person with console access), and a shorter page keeps the picker
 * and the editor it opens on-screen together.
 */
export const ADMIN_RBAC_PAGE_SIZE = 10;

export const ADMIN_RBAC_QUERY_PARAM = 'q';
export const ADMIN_RBAC_PAGE_PARAM = 'page';
export const ADMIN_RBAC_ADMIN_ID_PARAM = 'adminId';

export const ADMIN_RBAC_FIELD_NAMES = {
  adminId: 'adminId',
  permissions: 'permissions',
} as const;

export const ADMIN_RBAC_INITIAL_STATE: AdminRbacActionState = {
  status: 'idle',
  message: null,
};

/**
 * Message keys under the `admin` i18n namespace, resolved to translated text
 * by the container — mirrors `ADMIN_USER_ACTION_MESSAGE_KEYS`. The action
 * itself runs on the server and never resolves copy directly.
 */
export const ADMIN_RBAC_ACTION_MESSAGE_KEYS = {
  invalid: 'rbac.editor.errors.invalid',
  notFound: 'rbac.editor.errors.notFound',
  superAdminLocked: 'rbac.editor.errors.superAdminLocked',
  selfLockout: 'rbac.editor.errors.selfLockout',
  saved: 'rbac.editor.success.saved',
  noChange: 'rbac.editor.success.noChange',
} as const;

/** The `AdminUser` projection every RBAC repository read shares — one shape, so the picker and the editor's target can never disagree on which columns exist. */
export const ADMIN_RBAC_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  permissions: true,
  isSuperAdmin: true,
  status: true,
} as const;
