import { describe, expect, it } from 'vitest';

import {
  CONTROL_CHARACTER_GLOBAL_PATTERN,
  CONTROL_CHARACTER_PATTERN,
} from '@/shared/constants/text.constants';
import { hasValidSlugShape, isSlugCharacter } from '@/shared/utils/slug-shape.util';
import { compareAlphabetically, trimCharacter } from '@/shared/utils/text.util';

describe('control character patterns', () => {
  it.each([0x00, 0x08, 0x0b, 0x1f, 0x7f, 0x20_0b, 0x20_2e, 0x20_28, 0xfe_ff])(
    'matches U+%s',
    (codePoint) => {
      expect(CONTROL_CHARACTER_PATTERN.test(String.fromCodePoint(codePoint))).toBe(true);
    },
  );

  it.each(['\t', '\n', '\r', 'a', ' ', 'é', '中'])('leaves %j alone', (character) => {
    expect(CONTROL_CHARACTER_PATTERN.test(character)).toBe(false);
  });

  it('is stateless across calls, unlike a shared global pattern would be', () => {
    const zeroWidth = String.fromCodePoint(0x20_0b);

    expect(CONTROL_CHARACTER_PATTERN.test(zeroWidth)).toBe(true);
    expect(CONTROL_CHARACTER_PATTERN.test(zeroWidth)).toBe(true);
  });

  it('strips every match when used globally', () => {
    const input = `a${String.fromCodePoint(0x20_0b)}b${String.fromCodePoint(0x20_2e)}c`;

    expect(input.replaceAll(CONTROL_CHARACTER_GLOBAL_PATTERN, '')).toBe('abc');
  });
});

describe('trimCharacter', () => {
  it.each([
    ['--jane--', '-', 'jane'],
    ['jane', '-', 'jane'],
    ['---', '-', ''],
    ['', '-', ''],
    ['-jane', '-', 'jane'],
    ['jane-', '-', 'jane'],
  ])('trims %j', (input, character, expected) => {
    expect(trimCharacter(input, character)).toBe(expected);
  });
});

describe('compareAlphabetically', () => {
  it('orders strings case-insensitively', () => {
    expect(['b', 'A', 'c'].toSorted(compareAlphabetically)).toEqual(['A', 'b', 'c']);
  });

  it('returns zero for equal values', () => {
    expect(compareAlphabetically('a', 'a')).toBe(0);
  });
});

describe('isSlugCharacter', () => {
  it.each(['a', 'z', '0', '9'])('accepts %s', (character) => {
    expect(isSlugCharacter(character)).toBe(true);
  });

  it.each(['A', '-', '_', '.', 'é', ' '])('rejects %j', (character) => {
    expect(isSlugCharacter(character)).toBe(false);
  });
});

describe('hasValidSlugShape', () => {
  it.each(['jane', 'jane-doe', 'a1-b2-c3', 'x1'])('accepts %s', (value) => {
    expect(hasValidSlugShape(value)).toBe(true);
  });

  it.each(['', '-jane', 'jane-', 'jane--doe', 'Jane', 'jane_doe', 'jane.doe', 'jané', '-'])(
    'rejects %j',
    (value) => {
      expect(hasValidSlugShape(value)).toBe(false);
    },
  );

  it('stays linear on a long non-matching input', () => {
    const start = performance.now();

    expect(hasValidSlugShape(`${'a-'.repeat(20_000)}!`)).toBe(false);
    expect(performance.now() - start).toBeLessThan(500);
  });
});
