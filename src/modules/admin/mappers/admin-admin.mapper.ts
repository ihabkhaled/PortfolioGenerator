import type { AdminAdminListRow } from '../types/admin-admin-row.types';
import type { AdminManagedAdmin } from '../types/admin-admins.types';
import type { AdminRole, AdminUserStatus } from '../types/admin.types';

export function toAdminManagedAdmin(row: AdminAdminListRow): AdminManagedAdmin {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as AdminRole,
    status: row.status as AdminUserStatus,
    isSuperAdmin: row.isSuperAdmin,
    twoFactorEnabled: row.twoFactorEnabled,
    createdAt: row.createdAt,
  };
}
