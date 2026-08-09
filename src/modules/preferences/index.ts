/** Public surface of the preferences module (pure constants and types). */

export { preferencesClasses } from './constants/preferences-style.constants';
export { buildThemeOptions } from './helpers/theme-options.helper';
export {
  PREFERENCE_COOKIE_MAX_AGE_SECONDS,
  SAVED_LOCALE_COOKIE,
} from './constants/runtime-preferences.constants';
export { SAVED_THEME_COOKIE } from '@/packages/theme';
export { resolveRuntimeLocale, resolveRuntimeTheme } from './helpers/runtime-preferences.helper';
export type { ThemeOption, ThemeToggleProps } from './types/preferences.types';
