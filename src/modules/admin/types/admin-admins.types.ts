import type {
  AdminPermission,
  AdminRole,
  AdminUserStatus,
  SuperAdminGuardTarget,
} from './admin.types';

/** The two roles this screen can create — `SUPER_ADMIN` is seed-only, never assignable from a form. */
export type CreatableAdminRole = Exclude<AdminRole, 'SUPER_ADMIN'>;

/** An `AdminUser` as the admins-management screen sees it. */
export interface AdminManagedAdmin {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: AdminRole;
  readonly status: AdminUserStatus;
  readonly isSuperAdmin: boolean;
  readonly twoFactorEnabled: boolean;
  readonly createdAt: Date;
}

/**
 * A page of the admins list, plus everything the pager and the "showing X-Y
 * of Z" summary need — the same shape `AdminUserSearchResult` carries for the
 * platform-users screen, built from the same shared `pagination.helper.ts`
 * maths.
 */
export interface AdminAdminSearchResult {
  readonly admins: readonly AdminManagedAdmin[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
  readonly totalPages: number;
  readonly skip: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
}

/**
 * The minimal row every guarded admins-management mutation reads before
 * acting — enough for `assertNotSuperAdmin` (via `SuperAdminGuardTarget`) and
 * `assertNotSelfTarget`, nothing more. Fetched fresh from the database in the
 * action itself; never trusted from the request.
 */
export interface AdminAdminGuardRow extends SuperAdminGuardTarget {
  readonly id: string;
}

export interface AdminAdminCreateInput {
  readonly name: string;
  readonly email: string;
  readonly role: CreatableAdminRole;
  readonly password: string;
}

export type AdminAdminCreateResult =
  | { readonly ok: true; readonly id: string }
  | { readonly ok: false; readonly reason: 'duplicateEmail' };

/** The already-hashed, permission-resolved shape `insertAdminAdmin` writes — never a plaintext password. */
export interface AdminAdminInsertInput {
  readonly name: string;
  readonly email: string;
  readonly role: AdminRole;
  readonly permissions: readonly AdminPermission[];
  readonly passwordHash: string;
}
