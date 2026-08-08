import { describe, expect, it } from 'vitest';

import { PDF_HEADER_SEARCH_WINDOW } from '../constants/ingestion.constants';
import { hasPdfSignature, looksEncrypted, validateUpload } from '../policies/pdf-validation.policy';

/**
 * Upload validation is the first thing a hostile file meets. Every case here is
 * a shape a real attacker would send, not a synthetic edge case.
 */

function bytesFrom(text: string): Uint8Array {
  return new TextEncoder().encode(text);
}

function pdfBytes(body = 'body'): Uint8Array {
  return bytesFrom(`%PDF-1.7\n${body}`);
}

describe('hasPdfSignature', () => {
  it('accepts a normal PDF header', () => {
    expect(hasPdfSignature(pdfBytes())).toBe(true);
  });

  it('accepts a header after tolerated leading junk, as the spec allows', () => {
    expect(hasPdfSignature(bytesFrom(`${'\n'.repeat(20)}%PDF-1.4`))).toBe(true);
  });

  it.each([
    ['an HTML document renamed to .pdf', '<!doctype html><script>alert(1)</script>'],
    ['a ZIP archive', 'PK'],
    ['plain text', 'Dear hiring manager,'],
    ['an empty file', ''],
  ])('rejects %s', (_description, content) => {
    expect(hasPdfSignature(bytesFrom(content))).toBe(false);
  });

  it('does not scan past the header window, so a large file cannot make this expensive', () => {
    const late = bytesFrom(`${' '.repeat(PDF_HEADER_SEARCH_WINDOW + 50)}%PDF-1.7`);

    expect(hasPdfSignature(late)).toBe(false);
  });
});

describe('looksEncrypted', () => {
  it('detects the /Encrypt trailer entry', () => {
    expect(looksEncrypted(pdfBytes('trailer <</Encrypt 12 0 R>>'))).toBe(true);
  });

  it('leaves an ordinary document alone', () => {
    expect(looksEncrypted(pdfBytes('trailer <</Root 1 0 R>>'))).toBe(false);
  });
});

describe('validateUpload', () => {
  const maxBytes = 1024;

  it('accepts a valid PDF within the size limit', () => {
    const bytes = pdfBytes();

    expect(validateUpload({ bytes, sizeBytes: bytes.length, maxBytes })).toBeNull();
  });

  it('rejects an empty file', () => {
    expect(validateUpload({ bytes: new Uint8Array(), sizeBytes: 0, maxBytes })).toBe('empty');
  });

  it('rejects an oversized file before looking at its contents', () => {
    expect(validateUpload({ bytes: pdfBytes(), sizeBytes: maxBytes + 1, maxBytes })).toBe(
      'too-large',
    );
  });

  it('rejects a file whose bytes are not a PDF, whatever the browser claimed', () => {
    const bytes = bytesFrom('<!doctype html>');

    expect(validateUpload({ bytes, sizeBytes: bytes.length, maxBytes })).toBe('not-a-pdf');
  });

  it('rejects an encrypted PDF with its own reason, so the user can act on it', () => {
    const bytes = pdfBytes('trailer <</Encrypt 1 0 R>>');

    expect(validateUpload({ bytes, sizeBytes: bytes.length, maxBytes })).toBe('encrypted');
  });

  it('checks size before signature, so a huge non-PDF is cheap to reject', () => {
    const bytes = bytesFrom('not a pdf at all');

    expect(validateUpload({ bytes, sizeBytes: maxBytes + 1, maxBytes })).toBe('too-large');
  });
});
