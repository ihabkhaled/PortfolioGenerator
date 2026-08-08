import { describe, expect, it } from 'vitest';

import { createTranslator, interpolate } from '@/packages/i18n';

describe('interpolate', () => {
  it('replaces a named placeholder', () => {
    expect(interpolate('Updated {when}', { when: '2026-01-01' })).toBe('Updated 2026-01-01');
  });

  it('coerces numbers', () => {
    expect(interpolate('{count} items', { count: 3 })).toBe('3 items');
  });

  it('returns the template untouched when there are no values', () => {
    expect(interpolate('Plain text', undefined)).toBe('Plain text');
  });

  it('leaves an unknown placeholder visible rather than rendering "undefined"', () => {
    expect(interpolate('Hello {name}', { other: 'x' })).toBe('Hello {name}');
  });

  it('does not re-scan a substituted value, so a value containing braces is literal', () => {
    expect(interpolate('{a}', { a: '{b}', b: 'no' })).toBe('{b}');
  });
});

describe('createTranslator', () => {
  const translate = createTranslator('dashboard');

  it('resolves a nested key', () => {
    expect(translate('create.submit')).toBe('Create');
  });

  it('interpolates values', () => {
    expect(translate('meta.published', { when: '2026-01-01' })).toBe('Published 2026-01-01');
  });

  it('returns the qualified key for a missing message, rather than throwing', () => {
    expect(translate('does.not.exist')).toBe('dashboard.does.not.exist');
  });

  it('returns the qualified key when the path resolves to an object', () => {
    expect(translate('create')).toBe('dashboard.create');
  });

  it('returns the qualified key for an unknown namespace', () => {
    expect(createTranslator('nope')('any')).toBe('nope.any');
  });
});
