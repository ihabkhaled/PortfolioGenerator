'use client';
// client-boundary-reason: localStorage, matchMedia and the document element are
// browser APIs, and this package is the only place allowed to touch them.

import {
  COLOR_SCHEME_QUERY,
  SAVED_THEME_COOKIE,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  THEME_SYSTEM_OVERRIDE_KEY,
} from './theme.constants';
import type { ResolvedTheme, ThemePreference } from './theme.types';

/**
 * The theme as the browser holds it.
 *
 * Every function here tolerates a hostile or absent `localStorage` — Safari in
 * private mode throws on access — because a reader whose storage is disabled
 * should still get a working page in their OS theme rather than an error
 * boundary.
 */

export function readPreference(): ThemePreference {
  try {
    const stored = globalThis.localStorage.getItem(THEME_STORAGE_KEY);

    if (stored === 'light' || stored === 'dark') return stored;
    if (globalThis.localStorage.getItem(THEME_SYSTEM_OVERRIDE_KEY) === '1') return 'system';
    const saved = globalThis.document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${SAVED_THEME_COOKIE}=`))
      ?.split('=', 2)[1];
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return 'system';
  }
}

export function readSystemTheme(): ResolvedTheme {
  return globalThis.matchMedia(COLOR_SCHEME_QUERY).matches ? 'dark' : 'light';
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? readSystemTheme() : preference;
}

export function applyTheme(resolved: ResolvedTheme): void {
  const element = globalThis.document.documentElement;

  element.setAttribute(THEME_ATTRIBUTE, resolved);
  element.style.colorScheme = resolved;
}

export function persistPreference(preference: ThemePreference): void {
  try {
    if (preference === 'system') {
      globalThis.localStorage.removeItem(THEME_STORAGE_KEY);
      globalThis.localStorage.setItem(THEME_SYSTEM_OVERRIDE_KEY, '1');
      return;
    }
    globalThis.localStorage.removeItem(THEME_SYSTEM_OVERRIDE_KEY);
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // A reader with storage disabled keeps the choice for this page only.
  }
}

export function watchSystemTheme(onChange: (resolved: ResolvedTheme) => void): () => void {
  const query = globalThis.matchMedia(COLOR_SCHEME_QUERY);
  const listener = (event: MediaQueryListEvent): void => {
    onChange(event.matches ? 'dark' : 'light');
  };

  query.addEventListener('change', listener);

  return () => {
    query.removeEventListener('change', listener);
  };
}
