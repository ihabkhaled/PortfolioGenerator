import type { AdminUserActionState } from '../types/admin-user-action-view.types';
import type { AdminBadgeTone } from '../types/admin-users-view.types';
import type { AdminPortfolioStatus, AdminUserStatus } from '../types/admin.types';

/** Rows per page for the users list. Small enough that "Suspend" never sits far from the row it acts on. */
export const ADMIN_USERS_PAGE_SIZE = 20;

/** The `<th scope>` value for a column header — not user-facing copy, but a plain string literal all the same, so it lives here rather than inline in a `.component.tsx`. */
export const ADMIN_TABLE_COLUMN_SCOPE = 'col';

/** Query-string keys the list page reads and the search form/pagination links write — kept short and stable so a shared/bookmarked URL keeps working. */
export const ADMIN_USERS_QUERY_PARAM = 'q';
export const ADMIN_USERS_PAGE_PARAM = 'page';

export const ADMIN_USER_ACTION_FIELD_NAMES = {
  userId: 'userId',
  status: 'status',
} as const;

export const ADMIN_USER_ACTION_INITIAL_STATE: AdminUserActionState = {
  status: 'idle',
  message: null,
};

export const ADMIN_USER_STATUS_BADGE_TONE: Readonly<Record<AdminUserStatus, AdminBadgeTone>> = {
  ACTIVE: 'success',
  SUSPENDED: 'danger',
};

export const ADMIN_PORTFOLIO_STATUS_BADGE_TONE: Readonly<
  Record<AdminPortfolioStatus, AdminBadgeTone>
> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  UNPUBLISHED: 'warning',
};

/**
 * Message keys the actions in `admin-users.actions.ts` return and the row
 * containers translate. Grouped by outcome rather than by action, since
 * "not found" and "invalid" are shared across suspend/activate/reset.
 */
export const ADMIN_USER_ACTION_MESSAGE_KEYS = {
  invalid: 'users.actions.errors.invalid',
  notFound: 'users.actions.errors.notFound',
  resetFailed: 'users.actions.errors.resetFailed',
  suspended: 'users.actions.success.suspended',
  activated: 'users.actions.success.activated',
  resetSent: 'users.actions.success.resetSent',
} as const;
