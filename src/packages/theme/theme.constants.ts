/** The three states a reader can be in: two explicit, one deferred to the OS. */
export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const;

/** The attribute the stylesheet's `dark` variant keys on. */
export const THEME_ATTRIBUTE = 'data-theme';

/** Where the choice is remembered. Read by the inline script before paint. */
export const THEME_STORAGE_KEY = 'pg-theme';

export const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
