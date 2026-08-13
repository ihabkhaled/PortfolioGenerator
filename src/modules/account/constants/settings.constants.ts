import { COUNTRY_DIAL_CODES } from '@/shared/constants/country-codes.constants';

import type { AccountSettingsActionState } from '../types/settings.types';

export const ACCOUNT_SETTINGS_INITIAL_STATE: AccountSettingsActionState = {
  status: 'idle',
  error: null,
};

export const ACCOUNT_SETTINGS_FIELD_NAMES = {
  name: 'name',
  currentPassword: 'currentPassword',
  newPassword: 'newPassword',
  locale: 'locale',
  themePreference: 'themePreference',
  defaultCountryIso: 'defaultCountryIso',
  sessionToken: 'sessionToken',
} as const;

export const ACCOUNT_COUNTRY_ISOS = COUNTRY_DIAL_CODES.map(({ iso }) => iso);

export const ACCOUNT_SETTINGS_ERROR_KEYS = {
  invalidProfile: 'errors.nameRequired',
  invalidPassword: 'errors.weakPassword',
  passwordReused: 'errors.passwordReused',
  currentPasswordRejected: 'errors.invalidCredentials',
  unknown: 'errors.unknown',
} as const;
