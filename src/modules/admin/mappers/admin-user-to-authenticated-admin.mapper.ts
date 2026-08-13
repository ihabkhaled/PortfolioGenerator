import type { AdminUserRow, AuthenticatedAdmin } from '../types/admin.types';

/**
 * Narrows a full `AdminUser` row (which also carries `twoFactorEnabled`,
 * better-auth-managed fields, timestamps) to exactly what the authorization
 * policy and every downstream consumer need — nothing below the session
 * layer ever sees the full row.
 */
export function toAuthenticatedAdmin(row: AdminUserRow): AuthenticatedAdmin {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as AuthenticatedAdmin['role'],
    permissions: row.permissions as AuthenticatedAdmin['permissions'],
    isSuperAdmin: row.isSuperAdmin,
    status: row.status as AuthenticatedAdmin['status'],
  };
}
