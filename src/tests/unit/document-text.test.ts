import { describe, expect, it } from 'vitest';

import {
  DocumentTextError,
  extractDocumentText,
  inspectDocumentContainer,
} from '@/packages/document-text';
import { inspectOle } from '@/packages/document-text/container-inspection';
import { extractRtfText, stripRtfControlWords } from '@/packages/document-text/rtf-text';
import { buildDocxFixture } from '@/packages/document-text/test-support';

const encode = (value: string): Uint8Array => new TextEncoder().encode(value);

describe('document text extraction', () => {
  it('extracts raw text from a bounded DOCX without images or external resources', async () => {
    const bytes = buildDocxFixture('Ada Lovelace\nAnalytical engine programmer');

    const result = await extractDocumentText({
      bytes,
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      maxCharacters: 10_000,
      maxPages: 10,
    });

    expect(result.text).toContain('Ada Lovelace');
    expect(result.wasTruncated).toBe(false);
  });

  it('extracts RTF control words as text without interpreting embedded objects', async () => {
    const result = await extractDocumentText({
      bytes: encode('{\\rtf1\\ansi Ada \\b Lovelace\\b0\\par Engineer}'),
      contentType: 'application/rtf',
      maxCharacters: 10_000,
      maxPages: 10,
    });

    expect(result.text).toContain('Ada Lovelace');
    expect(result.text).toContain('Engineer');
    expect(result.pageCount).toBe(1);
  });

  it('truncates extracted text at the configured character boundary', async () => {
    const result = await extractDocumentText({
      bytes: encode(`{\\rtf1\\ansi ${'a'.repeat(200)}}`),
      contentType: 'application/rtf',
      maxCharacters: 50,
      maxPages: 10,
    });

    expect(result.text).toHaveLength(50);
    expect(result.wasTruncated).toBe(true);
  });

  it('rejects a document whose bounded page estimate exceeds policy', async () => {
    await expect(
      extractDocumentText({
        bytes: encode(`{\\rtf1\\ansi ${'word '.repeat(1000)}}`),
        contentType: 'application/rtf',
        maxCharacters: 10_000,
        maxPages: 1,
      }),
    ).rejects.toMatchObject({ code: 'too-many-pages' });
  });

  it('rejects macro, embedded-object and external-resource containers', () => {
    expect(() => {
      inspectDocumentContainer(buildDocxFixture('safe', { macro: true }), 'docx');
    }).toThrow(DocumentTextError);
    expect(() => {
      inspectDocumentContainer(buildDocxFixture('safe', { externalRelationship: true }), 'docx');
    }).toThrow(DocumentTextError);
    expect(() => {
      inspectDocumentContainer(encode('{\\rtf1\\ansi\\object unsafe}'), 'rtf');
    }).toThrow(DocumentTextError);
    expect(() => {
      inspectDocumentContainer(encode('WordDocument VBA ObjectPool'), 'doc');
    }).toThrow(DocumentTextError);
  });

  it('rejects unsupported content types rather than guessing a parser', async () => {
    await expect(
      extractDocumentText({
        bytes: encode('plain text'),
        contentType: 'text/plain',
        maxCharacters: 10_000,
        maxPages: 10,
      }),
    ).rejects.toMatchObject({ code: 'unsupported-type' });
  });
});

describe('RTF text normalization', () => {
  it('decodes hex, signed Unicode, escaped punctuation, tabs, and line controls', () => {
    const text = extractRtfText(
      encode(String.raw`{\rtf1\ansi Caf\'e9\tab \u-10179?\u-8704?\par \{literal\}\\}`),
    );

    expect(text).toContain('Café\t😀');
    expect(text).toContain('{literal}\\');
  });

  it('strips control words with signed numeric parameters and keeps plain slashes', () => {
    expect(stripRtfControlWords(String.raw`before\fs-24 after\\!`)).toBe(
      String.raw`beforeafter\\!`,
    );
  });

  it('recognizes an unsafe OLE marker encoded as UTF-16', () => {
    const bytes = new Uint8Array(Buffer.from('VBA', 'utf16le'));

    expect(() => {
      inspectOle(bytes);
    }).toThrow(DocumentTextError);
  });

  it('allows an OLE stream without an unsafe marker', () => {
    expect(() => {
      inspectOle(encode('ordinary document bytes'));
    }).not.toThrow();
  });
});
