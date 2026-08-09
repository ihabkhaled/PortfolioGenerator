import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { buildThemeOptions } from '@/modules/preferences';
import { ThemeToggleContainer } from '@/modules/preferences/preferences-ui';
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY, useTheme } from '@/packages/theme';

/**
 * The control a reader uses, and the state behind it.
 *
 * Three options rather than two: a reader whose OS switches at sunset should
 * not have to pick a side and stay there, so `system` is the default and stays
 * available.
 */

const options = buildThemeOptions((key: string) => key.replace('theme.', ''));

beforeEach(() => {
  globalThis.localStorage.clear();
  globalThis.document.documentElement.removeAttribute(THEME_ATTRIBUTE);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ThemeToggleContainer', () => {
  it('is one radio group with three options, not three loose buttons', () => {
    render(<ThemeToggleContainer label="Colour theme" options={options} />);

    const group = screen.getByRole('radiogroup', { name: 'Colour theme' });

    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  it('starts on system, because the server cannot know the reader chose otherwise', () => {
    render(<ThemeToggleContainer label="Colour theme" options={options} />);

    expect(screen.getByRole('radio', { name: 'system' })).toBeChecked();
  });

  it('remembers an explicit choice and applies it immediately', async () => {
    render(<ThemeToggleContainer label="Colour theme" options={options} />);

    await userEvent.click(screen.getByRole('radio', { name: 'dark' }));

    expect(screen.getByRole('radio', { name: 'dark' })).toBeChecked();
    expect(globalThis.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(globalThis.document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  // Going back to `system` must clear the key, or the reader's OS preference is
  // frozen at whatever it happened to be today.
  it('clears the stored choice when the reader returns to system', async () => {
    render(<ThemeToggleContainer label="Colour theme" options={options} />);

    await userEvent.click(screen.getByRole('radio', { name: 'light' }));
    await userEvent.click(screen.getByRole('radio', { name: 'system' }));

    expect(globalThis.localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
  });
});

describe('useTheme', () => {
  it('reconciles with storage after mount rather than during render', () => {
    globalThis.localStorage.setItem(THEME_STORAGE_KEY, 'dark');

    const { result } = renderHook(() => useTheme());

    expect(result.current.preference).toBe('dark');
    expect(result.current.resolved).toBe('dark');
  });

  it('reports the resolved theme alongside the preference', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setPreference('light');
    });

    expect(result.current.preference).toBe('light');
    expect(result.current.resolved).toBe('light');
  });

  it('follows a system theme change while the system preference is active', () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined;
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      addEventListener: (_type: string, next: (event: MediaQueryListEvent) => void) => {
        listener = next;
      },
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useTheme());

    act(() => {
      listener?.({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current.resolved).toBe('dark');
    expect(globalThis.document.documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });
});
