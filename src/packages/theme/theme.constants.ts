/** The three states a reader can be in: two explicit, one deferred to the OS. */
export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;

/** The attribute the stylesheet's `dark` variant keys on. */
export const THEME_ATTRIBUTE = 'data-theme';

/** Where the choice is remembered. Read by the inline script before paint. */
export const THEME_STORAGE_KEY = 'pg-theme';
export const THEME_SYSTEM_OVERRIDE_KEY = 'pg-theme-system';
export const SAVED_THEME_COOKIE = 'pg-saved-theme';
/** One-shot signal that a signed-in account should replace stale device state. */
export const THEME_ACCOUNT_SYNC_COOKIE = 'pg-theme-account-sync';

export const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
