import type { AuthFormState } from '../types/auth.types';

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
} as const;
