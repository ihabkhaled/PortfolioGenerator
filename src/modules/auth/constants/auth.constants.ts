import type { AuthFormState, PasswordRecoveryState } from '../types/auth.types';

export const AUTH_INITIAL_FORM_STATE: AuthFormState = { status: 'idle', error: null };

export const AUTH_ERROR_KEYS = {
  invalidCredentials: 'errors.invalidCredentials',
  emailTaken: 'errors.emailTaken',
  unknown: 'errors.unknown',
} as const;

export const AUTH_FIELD_NAMES = {
  name: 'name',
  email: 'email',
  password: 'password',
  newPassword: 'newPassword',
  resetToken: 'token',
} as const;

export const PASSWORD_RECOVERY_INITIAL_STATE: PasswordRecoveryState = {
  status: 'idle',
  error: null,
};
