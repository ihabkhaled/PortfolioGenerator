/**
 * Owner of the browser's theme surface: `localStorage`, `matchMedia` and the
 * `data-theme` attribute the stylesheet keys on.
 *
 * A theme is a reader's decision, not a tenant's. A portfolio can express a
 * preferred mode, but a visitor who has chosen dark keeps dark.
 */

export {
  COLOR_SCHEME_QUERY,
  THEME_ATTRIBUTE,
  THEME_PREFERENCES,
  THEME_STORAGE_KEY,
} from './theme.constants';
export { buildThemeScript } from './theme-script';
export {
  applyTheme,
  persistPreference,
  readPreference,
  readSystemTheme,
  resolveTheme,
  watchSystemTheme,
} from './theme-store';
export { useTheme } from './use-theme.hook';
export type { ResolvedTheme, ThemeController, ThemePreference } from './theme.types';
