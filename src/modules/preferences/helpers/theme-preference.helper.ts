import { THEME_PREFERENCES, type ThemePreference } from '@/packages/theme';

export function isThemePreference(value: string | null): value is ThemePreference {
  return value !== null && (THEME_PREFERENCES as readonly string[]).includes(value);
}
