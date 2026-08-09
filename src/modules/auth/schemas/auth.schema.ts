import { AUTH_MAX_PASSWORD_LENGTH, AUTH_MIN_PASSWORD_LENGTH } from '@/packages/auth';
import { z } from '@/packages/zod';

/**
 * Credential shapes, validated on the server before better-auth sees them.
 *
 * Error messages are i18n keys rather than sentences: the server decides what
 * went wrong, the client decides how to say it, and a validation message can
 * never leak a sentence written for a developer into a user's screen.
 */

const email = z.string().trim().toLowerCase().max(320).pipe(z.email('errors.invalidEmail'));

const password = z
  .string()
  .min(AUTH_MIN_PASSWORD_LENGTH, 'errors.weakPassword')
  .max(AUTH_MAX_PASSWORD_LENGTH, 'errors.weakPassword');

export const signInSchema = z.object({ email, password });

export const signUpSchema = z.object({
  name: z.string().trim().min(1, 'errors.nameRequired').max(120),
  email,
  password,
});

export const passwordResetRequestSchema = z.object({ email });

export const passwordResetSchema = z.object({
  token: z.string().min(1, 'errors.invalidResetToken').max(256, 'errors.invalidResetToken'),
  newPassword: password,
});
