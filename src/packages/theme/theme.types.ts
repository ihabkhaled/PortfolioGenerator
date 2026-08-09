import type { THEME_PREFERENCES } from './theme.constants';

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

/** What is actually painted: `system` has already been resolved. */
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeController {
  readonly preference: ThemePreference;
  readonly resolved: ResolvedTheme;
  readonly setPreference: (next: ThemePreference) => void;
}
