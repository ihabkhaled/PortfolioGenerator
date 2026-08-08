import { describe, expect, it } from 'vitest';

import { readBoundedString, readExtractionWarnings } from '@/modules/resume-ingestion';
import { WARNING_TEXT_MAX_LENGTH } from '@/shared/constants/security.constants';

/**
 * The warnings column is JSONB written by whichever build was deployed at the
 * time, so reading it back is a parse, not a cast. Every case here is a shape a
 * past or future build could plausibly have written.
 */
describe('readExtractionWarnings', () => {
  it('reads a well-formed list', () => {
    expect(
      readExtractionWarnings([
        { code: 'missing-end-date', path: 'experience.0.endDate', message: 'No end date found.' },
      ]),
    ).toEqual([
      { code: 'missing-end-date', path: 'experience.0.endDate', message: 'No end date found.' },
    ]);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an object', { code: 'x' }],
    ['a string', '[]'],
    ['a number', 7],
  ])('degrades to no warnings when the column holds %s', (_label, value) => {
    expect(readExtractionWarnings(value)).toEqual([]);
  });

  it('drops entries that are not objects', () => {
    expect(readExtractionWarnings(['broken', null, 42])).toEqual([]);
  });

  it('drops an entry with no message rather than rendering a blank row', () => {
    expect(readExtractionWarnings([{ code: 'x', path: 'y' }])).toEqual([]);
  });

  it('replaces a non-string field with an empty string instead of rendering it', () => {
    expect(readExtractionWarnings([{ code: 12, path: null, message: 'Check this.' }])).toEqual([
      { code: '', path: '', message: 'Check this.' },
    ]);
  });

  // A megabyte in a JSONB column should not become a megabyte in the DOM.
  it('bounds a long stored message', () => {
    const [warning] = readExtractionWarnings([{ code: 'x', path: 'y', message: 'a'.repeat(5000) }]);

    expect(warning?.message).toHaveLength(WARNING_TEXT_MAX_LENGTH);
  });
});

describe('readBoundedString', () => {
  it('passes a short string through', () => {
    expect(readBoundedString('fine')).toBe('fine');
  });

  it.each([[null], [undefined], [3], [{}], [[]]])('returns empty for %s', (value) => {
    expect(readBoundedString(value)).toBe('');
  });
});
