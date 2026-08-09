'use client';
// client-boundary-reason: the theme lives in the browser, and the OS preference
// can change while the page is open.

import { useCallback, useEffect, useState } from 'react';

import {
  applyTheme,
  persistPreference,
  readPreference,
  resolveTheme,
  watchSystemTheme,
} from './theme-store';
import type { ResolvedTheme, ThemeController, ThemePreference } from './theme.types';

/**
 * The theme, as a component sees it.
 *
 * Starts on `system` and reconciles after mount rather than reading storage
 * during render: the server has no storage, and a first render that disagreed
 * with the inline script would be a hydration mismatch on every page.
 */
export function useTheme(): ThemeController {
  const [preference, setState] = useState<ThemePreference>('system');
  const [resolved, setResolved] = useState<ResolvedTheme>('light');

  useEffect(() => {
    const stored = readPreference();

    setState(stored);
    setResolved(resolveTheme(stored));
  }, []);

  useEffect(() => {
    if (preference !== 'system') {
      return;
    }

    return watchSystemTheme((next) => {
      setResolved(next);
      applyTheme(next);
    });
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference): void => {
    const nextResolved = resolveTheme(next);

    setState(next);
    setResolved(nextResolved);
    persistPreference(next);
    applyTheme(nextResolved);
  }, []);

  return { preference, resolved, setPreference };
}
