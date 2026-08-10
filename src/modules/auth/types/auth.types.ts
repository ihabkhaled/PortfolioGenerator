/**
 * What a credential server action hands back to the form.
 *
 * `error` is a message key, never a provider message: "user not found" and
 * "wrong password" collapse to one key on purpose, so the sign-in form cannot
 * be used to enumerate which email addresses have accounts. `notice` is the
 * one deliberate exception — see `isEmailNotVerifiedError` — and is rendered
 * as a neutral, non-alarming message rather than an error.
 */
export interface AuthFormState {
  readonly status: 'idle' | 'error' | 'notice';
  readonly error: string | null;
  readonly notice: string | null;
}

export interface PasswordRecoveryState {
  readonly status: 'idle' | 'submitted' | 'error' | 'success';
  readonly error: string | null;
}

export { type AuthenticatedUser } from '@/packages/auth';
