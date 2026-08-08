import { describe, expect, it } from 'vitest';

import { SCANNED_CHARACTERS_PER_PAGE_THRESHOLD } from '../constants/ingestion.constants';
import { normalizeResumeText } from '../helpers/resume-text.helper';

describe('normalizeResumeText', () => {
  it('collapses runs of spaces without joining lines', () => {
    const result = normalizeResumeText('Senior     Engineer\nNorthwind     Payments', 1, 1000);

    expect(result.text).toBe('Senior Engineer\nNorthwind Payments');
  });

  it('preserves paragraph breaks, which are the model’s only structural signal', () => {
    const result = normalizeResumeText('Summary\n\n\n\nExperience', 1, 1000);

    expect(result.text).toBe('Summary\n\nExperience');
  });

  it('normalizes Windows and classic Mac line endings', () => {
    const result = normalizeResumeText('a\r\nb\rc', 1, 1000);

    expect(result.text).toBe('a\nb\nc');
  });

  it('strips control characters a PDF extractor leaves behind', () => {
    const result = normalizeResumeText(`Amina${String.fromCodePoint(0)}Rahman`, 1, 1000);

    expect(result.text).toBe('AminaRahman');
  });

  it('caps pathological input and says that it did', () => {
    const result = normalizeResumeText('a'.repeat(500), 1, 100);

    expect(result.characterCount).toBe(100);
    expect(result.wasTruncated).toBe(true);
  });

  it('does not report truncation when the text fits', () => {
    expect(normalizeResumeText('short', 1, 100).wasTruncated).toBe(false);
  });

  it('flags a likely scan, so the user gets a real explanation instead of an empty draft', () => {
    const result = normalizeResumeText('a'.repeat(10), 2, 1000);

    expect(result.looksScanned).toBe(true);
  });

  it('does not flag a normal text-layer CV', () => {
    const text = 'x'.repeat(SCANNED_CHARACTERS_PER_PAGE_THRESHOLD * 3);

    expect(normalizeResumeText(text, 2, 100_000).looksScanned).toBe(false);
  });

  it('treats a zero page count as one, rather than dividing by zero', () => {
    expect(normalizeResumeText('x'.repeat(500), 0, 1000).looksScanned).toBe(false);
  });
});
