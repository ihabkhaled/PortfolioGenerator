/**
 * What a credential server action hands back to the form.
 *
 * `error` is a message key, never a provider message: "user not found" and
 * "wrong password" collapse to one key on purpose, so the sign-in form cannot
 * be used to enumerate which email addresses have accounts.
 */
export interface AuthFormState {
  readonly status: 'idle' | 'error';
  readonly error: string | null;
}

export { type AuthenticatedUser } from '@/packages/auth';
