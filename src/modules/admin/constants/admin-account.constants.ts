import type { AdminAccountActionState } from '../types/admin-account-view.types';

export const ADMIN_ACCOUNT_INITIAL_STATE: AdminAccountActionState = {
  status: 'idle',
  error: null,
};

export const ADMIN_ACCOUNT_FIELD_NAMES = {
  currentPassword: 'currentPassword',
  newPassword: 'newPassword',
} as const;

/**
 * Message keys under the `admin` i18n namespace, resolved to translated text
 * by whichever container calls the action — actions themselves run on the
 * server and never resolve copy directly, mirroring `ADMIN_AUTH_ERROR_KEYS`.
 */
export const ADMIN_ACCOUNT_ERROR_KEYS = {
  weakPassword: 'errors.weakPassword',
  passwordReused: 'errors.passwordReused',
  currentPasswordRejected: 'errors.currentPasswordRejected',
  unknown: 'errors.unknown',
} as const;
