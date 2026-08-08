/**
 * Public surface of the auth module.
 *
 * Server-only pieces (`requireOwner`, `getCurrentUser`) are exported from
 * `./services/require-owner.service` through this barrel; importing them from
 * a client component is a build error thanks to `server-only`, which is the
 * behavior we want rather than a lint rule we hope people read.
 */

export { authClasses } from './constants/auth-style.constants';
export { SignInFormContainer } from './containers/sign-in-form.container';
export { SignOutButtonContainer } from './containers/sign-out-button.container';
export { SignUpFormContainer } from './containers/sign-up-form.container';
export type { AuthenticatedUser, AuthFormState } from './types/auth.types';
