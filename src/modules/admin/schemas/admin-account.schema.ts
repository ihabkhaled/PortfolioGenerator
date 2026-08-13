import { ADMIN_AUTH_MIN_PASSWORD_LENGTH } from '@/packages/admin-auth/admin-auth.constants';
import { z } from '@/packages/zod';

/**
 * The admin's own password change, submitted from `/managawy/account`.
 *
 * Each failure keeps its own message key rather than collapsing to one
 * generic string: "too short" and "same as your current password" are
 * different mistakes, and the message an admin sees should say which one
 * they made.
 */
export const adminPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'errors.currentPasswordRejected'),
    newPassword: z.string().min(ADMIN_AUTH_MIN_PASSWORD_LENGTH, 'errors.weakPassword'),
  })
  .refine(({ currentPassword, newPassword }) => currentPassword !== newPassword, {
    message: 'errors.passwordReused',
    path: ['newPassword'],
  });
