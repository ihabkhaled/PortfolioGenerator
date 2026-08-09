import type { AppLocale } from '@/modules/localization';
import type { ThemePreference } from '@/packages/theme';

export interface AccountSettingsActionState {
  readonly status: 'idle' | 'error' | 'success';
  readonly error: string | null;
}

export interface AccountPreferences {
  readonly locale: AppLocale;
  readonly themePreference: ThemePreference;
  readonly defaultCountryIso: string | null;
}
