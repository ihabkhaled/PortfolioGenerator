import { describe, expect, it } from 'vitest';

import {
  isReservedSlug,
  normalizeSlug,
  RESERVED_SLUG_SEGMENTS,
  SLUG_MAX_LENGTH,
  suggestSlug,
  validateSlug,
} from '@/modules/publishing';
import { MARKETING_ROUTE_PATHS, ROUTE_PATHS } from '@/shared/constants/route-paths.constants';
import { compareAlphabetically } from '@/shared/utils/text.util';

describe('normalizeSlug', () => {
  it('lowercases and hyphenates a display name', () => {
    expect(normalizeSlug('Jane Doe')).toBe('jane-doe');
  });

  it('transliterates accented characters instead of percent-encoding them', () => {
    expect(normalizeSlug('José Álvarez')).toBe('jose-alvarez');
  });

  it('collapses runs of separators and trims the edges', () => {
    expect(normalizeSlug('  --Jane   ///  Doe-- ')).toBe('jane-doe');
  });

  it('drops characters that have no ASCII equivalent', () => {
    expect(normalizeSlug('إيهاب')).toBe('');
  });

  it('never returns a value longer than the maximum, or one ending in a hyphen', () => {
    const normalized = normalizeSlug('a'.repeat(SLUG_MAX_LENGTH + 20));

    expect(normalized).toHaveLength(SLUG_MAX_LENGTH);
    expect(normalized.endsWith('-')).toBe(false);
  });

  it('does not leave a trailing hyphen after truncation', () => {
    const normalized = normalizeSlug(`${'a'.repeat(SLUG_MAX_LENGTH - 1)} b`);

    expect(normalized.endsWith('-')).toBe(false);
  });
});

describe('validateSlug', () => {
  it('accepts a well-formed slug', () => {
    expect(validateSlug('jane-doe')).toEqual({ ok: true, slug: 'jane-doe' });
  });

  it('rejects an empty slug', () => {
    expect(validateSlug(' '.repeat(3))).toEqual({ ok: false, reason: 'empty' });
  });

  it('rejects a slug below the minimum length', () => {
    expect(validateSlug('ab')).toEqual({ ok: false, reason: 'too-short' });
  });

  it('rejects a slug above the maximum length', () => {
    expect(validateSlug('a'.repeat(SLUG_MAX_LENGTH + 1))).toEqual({
      ok: false,
      reason: 'too-long',
    });
  });

  it.each([
    ['uppercase', 'Jane-Doe'],
    ['a leading hyphen', '-jane'],
    ['a trailing hyphen', 'jane-'],
    ['a double hyphen', 'jane--doe'],
    ['a dot', 'jane.doe'],
    ['a parent-directory reference', '../../etc/passwd'],
    ['a forward slash', 'jane/doe'],
    ['a backslash', String.raw`jane\doe`],
    ['percent-encoded traversal', '%2e%2e%2f'],
    ['an underscore', 'jane_doe'],
    ['a space', 'jane doe'],
    ['non-ASCII characters', 'jané'],
    ['a tab', 'jane\tdoe'],
    ['a null byte', `jane${String.fromCodePoint(0)}doe`],
  ])('rejects %s', (_description, candidate) => {
    expect(validateSlug(candidate)).toEqual({ ok: false, reason: 'invalid-characters' });
  });

  it('rejects a reserved platform word', () => {
    expect(validateSlug('dashboard')).toEqual({ ok: false, reason: 'reserved' });
  });

  it.each(['.', '..'])(
    'rejects the traversal token %s (on length, before the character check)',
    (candidate) => {
      expect(validateSlug(candidate).ok).toBe(false);
    },
  );
});

describe('reserved slug policy', () => {
  // The home route is `/` and contributes no segment; everything else must be
  // reserved, which is what keeps a new platform route from being claimable as
  // a portfolio slug.
  const routeSegments = Object.values(ROUTE_PATHS)
    .map((path) => path.split('/').find(Boolean))
    .filter((segment): segment is string => segment !== undefined);

  it.each(routeSegments)('reserves the platform route segment %s', (segment) => {
    expect(isReservedSlug(segment)).toBe(true);
  });

  it.each(Object.values(MARKETING_ROUTE_PATHS))('reserves the marketing route %s', (path) => {
    expect(isReservedSlug(path.slice(1))).toBe(true);
  });

  it('covers every platform route except the root', () => {
    expect(routeSegments).toHaveLength(Object.values(ROUTE_PATHS).length - 1);
  });

  it('is sorted and free of duplicates so review diffs stay readable', () => {
    expect(RESERVED_SLUG_SEGMENTS).toEqual(
      [...new Set(RESERVED_SLUG_SEGMENTS)].toSorted(compareAlphabetically),
    );
  });
});

describe('suggestSlug', () => {
  it('suggests the normalized display name', () => {
    expect(suggestSlug('Jane Doe')).toBe('jane-doe');
  });

  it('falls back when the name normalizes to nothing', () => {
    expect(suggestSlug('إيهاب')).toBe('portfolio-1');
  });

  it('pads a name that is too short to be a valid slug', () => {
    expect(suggestSlug('Jo')).toBe('jo-portfolio');
  });

  it('escapes a reserved word rather than suggesting an unusable slug', () => {
    expect(suggestSlug('Admin')).toBe('admin-1');
    expect(validateSlug(suggestSlug('Admin')).ok).toBe(true);
  });
});
