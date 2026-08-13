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

/**
 * Declared as a plain string-literal union rather than imported from
 * `@prisma/client`, matching `PortfolioStatus` in
 * `src/modules/portfolios/types/portfolio.types.ts`: `@prisma/client` stays
 * confined to `src/packages/database/`.
 */
export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export { type AuthenticatedUser } from '@/packages/auth';
