import type { AdminSignInFormState } from '../types/admin-auth-view.types';

export const ADMIN_SIGN_IN_INITIAL_STATE: AdminSignInFormState = {
  status: 'idle',
  error: null,
};

/**
 * Message keys under the `admin` i18n namespace, resolved to translated text
 * by whichever container calls the action — actions themselves run on the
 * server and never resolve copy directly, mirroring `AUTH_ERROR_KEYS`.
 */
export const ADMIN_AUTH_ERROR_KEYS = {
  missingCredentials: 'errors.missingCredentials',
  invalidCredentials: 'errors.invalidCredentials',
  missingCode: 'errors.missingCode',
  invalidCode: 'errors.invalidCode',
  missingConfirmCode: 'errors.missingConfirmCode',
  rateLimited: 'errors.rateLimited',
} as const;
