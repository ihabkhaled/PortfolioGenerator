import { describe, expect, it } from 'vitest';

import { resolveRuntimeLocale, resolveRuntimeTheme } from '@/modules/preferences';

describe('runtime preference precedence', () => {
  it('prefers a URL locale over a saved locale and English', () => {
    expect(resolveRuntimeLocale('ar', 'fr')).toBe('ar');
    expect(resolveRuntimeLocale(null, 'fr')).toBe('fr');
    expect(resolveRuntimeLocale(null, null)).toBe('en');
    expect(resolveRuntimeLocale('unsupported', 'de')).toBe('de');
    expect(resolveRuntimeLocale('unsupported', 'unsupported')).toBe('en');
  });

  it('prefers an explicit theme over a saved theme and then the operating system', () => {
    expect(resolveRuntimeTheme('dark', 'light')).toBe('dark');
    expect(resolveRuntimeTheme(null, 'light')).toBe('light');
    expect(resolveRuntimeTheme(null, 'system')).toBe('system');
    expect(resolveRuntimeTheme('system', 'dark')).toBe('dark');
    expect(resolveRuntimeTheme('unsupported', 'light')).toBe('light');
    expect(resolveRuntimeTheme('unsupported', 'unsupported')).toBe('system');
  });
});
