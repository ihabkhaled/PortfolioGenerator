import type { AdminAdminActionState } from '../types/admin-admins-view.types';
import type { CreatableAdminRole } from '../types/admin-admins.types';
import type { AdminBadgeTone } from '../types/admin-users-view.types';
import type { AdminUserStatus } from '../types/admin.types';

/** Rows per page for the admins list. Small enough that "Suspend" never sits far from the row it acts on — matches `ADMIN_USERS_PAGE_SIZE`. */
export const ADMIN_ADMINS_PAGE_SIZE = 20;

/** Query-string keys the list page reads and the search form/pagination links write. */
export const ADMIN_ADMINS_QUERY_PARAM = 'q';
export const ADMIN_ADMINS_PAGE_PARAM = 'page';

/** Form field names shared by the create/suspend/activate/delete actions and their containers. */
export const ADMIN_ADMIN_FIELD_NAMES = {
  adminId: 'adminId',
  status: 'status',
  name: 'name',
  email: 'email',
  role: 'role',
  password: 'password',
} as const;

export const ADMIN_ADMIN_ACTION_INITIAL_STATE: AdminAdminActionState = {
  status: 'idle',
  message: null,
};

export const ADMIN_ADMIN_STATUS_BADGE_TONE: Readonly<Record<AdminUserStatus, AdminBadgeTone>> = {
  ACTIVE: 'success',
  SUSPENDED: 'danger',
};

/**
 * The only two roles the create form can assign. `SUPER_ADMIN` has no
 * default-permission gap to fill from this screen — it exists exactly once,
 * seeded by `support/seed-super-admin.mts`.
 */
export const ADMIN_CREATABLE_ROLES: readonly CreatableAdminRole[] = ['ADMIN', 'MODERATOR'];

/**
 * Message keys under the `admin` i18n namespace, resolved to translated text
 * by whichever container calls the action — actions run on the server and
 * never resolve copy directly, mirroring `ADMIN_USER_ACTION_MESSAGE_KEYS`.
 */
export const ADMIN_ADMIN_ACTION_MESSAGE_KEYS = {
  invalid: 'admins.actions.errors.invalid',
  notFound: 'admins.actions.errors.notFound',
  protected: 'admins.actions.errors.protected',
  selfLockout: 'admins.actions.errors.selfLockout',
  duplicateEmail: 'admins.actions.errors.duplicateEmail',
  created: 'admins.actions.success.created',
  suspended: 'admins.actions.success.suspended',
  activated: 'admins.actions.success.activated',
  deleted: 'admins.actions.success.deleted',
} as const;
