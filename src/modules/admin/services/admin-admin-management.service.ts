import 'server-only';

import { hashAdminPassword } from '@/packages/admin-auth/server';

import { DEFAULT_ROLE_PERMISSIONS } from '../constants/admin-permission.constants';
import { insertAdminAdmin } from '../repositories/admin-admins.repository';
import type { AdminAdminCreateInput, AdminAdminCreateResult } from '../types/admin-admins.types';

/**
 * Assembles a new admin or moderator exactly the way
 * `support/seed-super-admin.mts` assembles the super admin: permissions
 * resolved from `DEFAULT_ROLE_PERMISSIONS` at creation time — never merged
 * later, the Phase 3 RBAC editor overwrites wholesale — and the password
 * hashed with the same hasher `emailAndPassword` verifies against, so the new
 * admin can sign in with `signInEmail` on the very first attempt and is then
 * forced through 2FA enrollment, same as every other admin.
 */
export async function createManagedAdmin(
  input: AdminAdminCreateInput,
): Promise<AdminAdminCreateResult> {
  const passwordHash = await hashAdminPassword(input.password);

  return insertAdminAdmin({
    name: input.name,
    email: input.email,
    role: input.role,
    permissions: DEFAULT_ROLE_PERMISSIONS[input.role],
    passwordHash,
  });
}
