import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildThemeOptions } from '@/modules/preferences';
import {
  applyTheme,
  buildThemeScript,
  persistPreference,
  readPreference,
  readSystemTheme,
  resolveTheme,
  SAVED_THEME_COOKIE,
  THEME_ATTRIBUTE,
  THEME_ACCOUNT_SYNC_COOKIE,
  THEME_STORAGE_KEY,
  THEME_SYSTEM_OVERRIDE_KEY,
  useTheme,
  watchSystemTheme,
} from '@/packages/theme';
import { toInlineScript } from '@/shared/utils/inline-script.util';

/**
 * The theme is the one piece of state that lives in the reader's browser and
 * has to be correct *before* the first paint. Everything here is about the
 * failure modes that produce a flash of the wrong colour, or an error boundary
 * on a browser with storage disabled.
 */

function stubMatchMedia(matches: boolean, listeners: ((event: MediaQueryListEvent) => void)[]) {
  vi.stubGlobal('matchMedia', () => ({
    matches,
    addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.push(listener);
    },
    removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
      const index = listeners.indexOf(listener);

      if (index !== -1) listeners.splice(index, 1);
    },
  }));
}

beforeEach(() => {
  globalThis.localStorage.clear();
  globalThis.document.documentElement.removeAttribute(THEME_ATTRIBUTE);
  Reflect.set(globalThis.document, 'cookie', `${SAVED_THEME_COOKIE}=; path=/; max-age=0`);
  Reflect.set(globalThis.document, 'cookie', `${THEME_ACCOUNT_SYNC_COOKIE}=; path=/; max-age=0`);
});

afterEach(() => {
  vi.unstubAllGlobals();
  // The storage spies below replace a prototype method; without a restore they
  // leak into every test that runs after them in this file.
  vi.restoreAllMocks();
});

describe('buildThemeScript', () => {
  // The script runs before React exists, so it can only rely on what it names.
  it('reads the stored key and stamps the attribute the stylesheet uses', () => {
    const script = buildThemeScript();

    expect(script).toContain(THEME_STORAGE_KEY);
    expect(script).toContain(THEME_ATTRIBUTE);
    expect(script).toContain('prefers-color-scheme: dark');
  });

  it('lets a freshly authenticated account replace stale device theme state once', () => {
    const script = buildThemeScript();

    expect(script).toContain(THEME_ACCOUNT_SYNC_COOKIE);
    expect(script).toContain(`localStorage.setItem('${THEME_STORAGE_KEY}'`);
    expect(script).toContain('max-age=0');
  });

  // A throwing `localStorage` — Safari in private mode — must not take the page
  // down before it has rendered anything.
  it('swallows its own failure rather than breaking the document', () => {
    expect(buildThemeScript()).toContain('catch(e){}');
  });
});

describe('readPreference', () => {
  it('defaults to following the system', () => {
    expect(readPreference()).toBe('system');
  });

  it.each(['light', 'dark'] as const)('reads a stored %s choice', (preference) => {
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, preference);

    expect(readPreference()).toBe(preference);
  });

  // A value from an older build, or from a different product on the same
  // origin, is not a theme.
  it('ignores a stored value it does not recognise', () => {
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, 'sepia');

    expect(readPreference()).toBe('system');
  });

  it('falls back to system when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });

    expect(readPreference()).toBe('system');
  });

  it('lets a signed-in account replace stale local theme state after a soft navigation', () => {
    const deleteCookie = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('cookieStore', { delete: deleteCookie });
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    Reflect.set(globalThis.document, 'cookie', `${SAVED_THEME_COOKIE}=dark; path=/`);
    Reflect.set(globalThis.document, 'cookie', `${THEME_ACCOUNT_SYNC_COOKIE}=1; path=/`);

    expect(readPreference()).toBe('dark');
    expect(globalThis.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(deleteCookie).toHaveBeenCalledWith({ name: THEME_ACCOUNT_SYNC_COOKIE, path: '/' });
  });

  it('restores an account that follows the system after a soft navigation', () => {
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    Reflect.set(globalThis.document, 'cookie', `${SAVED_THEME_COOKIE}=system; path=/`);
    Reflect.set(globalThis.document, 'cookie', `${THEME_ACCOUNT_SYNC_COOKIE}=1; path=/`);

    expect(readPreference()).toBe('system');
    expect(globalThis.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(globalThis.localStorage.getItem(THEME_SYSTEM_OVERRIDE_KEY)).toBe('1');
  });
});

describe('useTheme', () => {
  it('applies an account theme reconciled after a soft navigation', async () => {
    vi.stubGlobal('cookieStore', { delete: vi.fn().mockResolvedValue(undefined) });
    stubMatchMedia(false, []);
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    Reflect.set(globalThis.document, 'cookie', `${SAVED_THEME_COOKIE}=dark; path=/`);
    Reflect.set(globalThis.document, 'cookie', `${THEME_ACCOUNT_SYNC_COOKIE}=1; path=/`);

    const { result } = renderHook(() => useTheme());

    await waitFor(() => {
      expect(result.current.preference).toBe('dark');
      expect(globalThis.document.documentElement).toHaveAttribute(THEME_ATTRIBUTE, 'dark');
    });
  });
});

describe('resolveTheme', () => {
  it.each([
    ['light', 'light'],
    ['dark', 'dark'],
  ] as const)('passes an explicit %s choice through', (preference, expected) => {
    expect(resolveTheme(preference)).toBe(expected);
  });

  it('resolves system against the media query', () => {
    stubMatchMedia(true, []);

    expect(resolveTheme('system')).toBe('dark');
    expect(readSystemTheme()).toBe('dark');
  });

  it('resolves system to light when the query does not match', () => {
    stubMatchMedia(false, []);

    expect(resolveTheme('system')).toBe('light');
  });
});

describe('applyTheme', () => {
  it('stamps both the attribute and the colour scheme', () => {
    applyTheme('dark');

    const element = globalThis.document.documentElement;

    expect(element.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
    expect(element.style.colorScheme).toBe('dark');
  });
});

describe('persistPreference', () => {
  it('stores an explicit choice', () => {
    persistPreference('dark');

    expect(globalThis.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  // Storing "system" would freeze the reader's OS preference at today's value.
  it('clears the key when the reader goes back to following the system', () => {
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    persistPreference('system');

    expect(globalThis.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });

  it('keeps working when storage refuses to write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });

    expect(() => {
      persistPreference('light');
    }).not.toThrow();
  });

  it('keeps working when storage refuses to remove a system preference', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('denied');
    });

    expect(() => {
      persistPreference('system');
    }).not.toThrow();
  });
});

describe('watchSystemTheme', () => {
  it('reports a change and stops after unsubscribing', () => {
    const listeners: ((event: MediaQueryListEvent) => void)[] = [];
    const onChange = vi.fn();

    stubMatchMedia(false, listeners);

    const unsubscribe = watchSystemTheme(onChange);

    listeners[0]?.({ matches: true } as MediaQueryListEvent);
    expect(onChange).toHaveBeenCalledWith('dark');

    listeners[0]?.({ matches: false } as MediaQueryListEvent);
    expect(onChange).toHaveBeenLastCalledWith('light');

    unsubscribe();
    expect(listeners).toHaveLength(0);
  });
});

describe('buildThemeOptions', () => {
  it('offers all three preferences, labelled from the catalog', () => {
    const options = buildThemeOptions((key: string) => `label:${key}`);

    expect(options).toEqual([
      { value: 'light', label: 'label:theme.light' },
      { value: 'dark', label: 'label:theme.dark' },
      { value: 'system', label: 'label:theme.system' },
    ]);
  });
});

describe('toInlineScript', () => {
  it('passes an ordinary script body through', () => {
    expect(toInlineScript('var a=1;')).toEqual({ __html: 'var a=1;' });
  });

  // A `</script>` sequence inside a script body ends the element early, and
  // React does not escape script bodies.
  it('neutralises a closing tag hiding inside the body', () => {
    const markup = toInlineScript('var a="</script><img onerror=alert(1)>";');

    expect(markup.__html).not.toContain('</script>');
    expect(markup.__html).toContain(String.raw`<\/script>`);
  });
});
