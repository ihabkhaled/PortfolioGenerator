import { DEFAULT_LOCALE, isAppLocale, type AppLocale } from '@/modules/localization';
import type { ThemePreference } from '@/packages/theme';

import { isThemePreference } from './theme-preference.helper';

export function resolveRuntimeLocale(
  urlLocale: string | null,
  savedLocale: string | null,
): AppLocale {
  if (urlLocale !== null && isAppLocale(urlLocale)) return urlLocale;
  return savedLocale !== null && isAppLocale(savedLocale) ? savedLocale : DEFAULT_LOCALE;
}

export function resolveRuntimeTheme(
  explicitTheme: string | null,
  savedTheme: string | null,
): ThemePreference {
  if (explicitTheme !== 'system' && isThemePreference(explicitTheme)) return explicitTheme;
  return isThemePreference(savedTheme) ? savedTheme : 'system';
}
