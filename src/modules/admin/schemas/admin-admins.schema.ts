import {
  ADMIN_AUTH_MAX_PASSWORD_LENGTH,
  ADMIN_AUTH_MIN_PASSWORD_LENGTH,
} from '@/packages/admin-auth/admin-auth.constants';
import { z } from '@/packages/zod';

/** An `AdminUser` id: opaque, non-empty, and bounded — the same shape `adminUserIdSchema` validates ids with. */
export const adminAdminIdSchema = z.object({
  adminId: z.string().min(1).max(120),
});

export const adminAdminStatusChangeSchema = z.object({
  adminId: z.string().min(1).max(120),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
});

/**
 * A type-guard `.refine` rather than `z.enum(['ADMIN', 'MODERATOR'])`: every
 * other field on `adminAdminCreateSchema` carries its own message key, and an
 * enum mismatch needs one too so `createAdminAdminAction` can trust
 * `issues[0]?.message` is always a translatable key, never zod's own default
 * English sentence. `SUPER_ADMIN` is deliberately absent from the allowed
 * values — that role is seed-only, never assignable from this form.
 */
const creatableAdminRoleSchema = z
  .string()
  .refine(
    (value): value is 'ADMIN' | 'MODERATOR' => value === 'ADMIN' || value === 'MODERATOR',
    'admins.actions.errors.invalidRole',
  );

/**
 * The new-admin form. Every failure keeps its own message key — mirroring
 * `signUpSchema` in `src/modules/auth/schemas/auth.schema.ts` — so a weak
 * password and a missing name read as the distinct mistakes they are.
 */
export const adminAdminCreateSchema = z.object({
  name: z.string().trim().min(1, 'admins.actions.errors.nameRequired').max(200),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .pipe(z.email('admins.actions.errors.invalidEmail')),
  role: creatableAdminRoleSchema,
  password: z
    .string()
    .min(ADMIN_AUTH_MIN_PASSWORD_LENGTH, 'admins.actions.errors.weakPassword')
    .max(ADMIN_AUTH_MAX_PASSWORD_LENGTH, 'admins.actions.errors.weakPassword'),
});
