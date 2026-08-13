/**
 * The database projection the admin-admins repository returns.
 *
 * Declared structurally rather than importing Prisma's generated `AdminUser`
 * model type: `@prisma/client` is confined to `src/packages/database/`, and
 * `role`/`status` are plain `string` here, cast to their narrow union at the
 * mapper boundary — the same convention `AdminUserListRow` follows in
 * `src/modules/admin/types/admin-user-row.types.ts`.
 */
export interface AdminAdminListRow {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: string;
  readonly status: string;
  readonly isSuperAdmin: boolean;
  readonly twoFactorEnabled: boolean;
  readonly createdAt: Date;
}
