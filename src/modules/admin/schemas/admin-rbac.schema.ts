import { z } from '@/packages/zod';

import { ADMIN_RBAC_PERMISSIONS_ORDER } from '../constants/admin-rbac.constants';

/**
 * The save-permissions form's payload: the target admin id, and the full
 * next permission set as submitted — every checked box, nothing merged with
 * what is already stored. An empty array is valid input (it means "grant
 * this admin nothing"); the action, not this schema, is what refuses to save
 * an empty-of-`RBAC_MANAGE` set for the caller's own account.
 */
export const adminRbacPermissionsUpdateSchema = z.object({
  adminId: z.string().min(1).max(120),
  permissions: z
    .array(z.enum(ADMIN_RBAC_PERMISSIONS_ORDER))
    .max(ADMIN_RBAC_PERMISSIONS_ORDER.length),
});
