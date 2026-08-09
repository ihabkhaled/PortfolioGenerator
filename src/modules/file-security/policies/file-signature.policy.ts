import {
  DOCUMENT_FORMATS,
  FILE_SIGNATURES,
  FORBIDDEN_EXTENSIONS,
  IMAGE_FORMATS,
  RTF_PREFIX,
} from '../constants/file-signature.constants';
import { containsBytes } from '../helpers/byte-search.helper';
import type { FileFormatTable, FileKind } from '../types/file-security.types';

/**
 * What the bytes say the file is.
 *
 * Returns every format whose signature matches, because containers overlap: a
 * DOCX and an XLSX are both ZIPs, and WebP is a RIFF. The caller decides
 * whether the declared type is among them.
 */
export function detectSignatures(bytes: Uint8Array): readonly string[] {
  const matched: string[] = FILE_SIGNATURES.filter((signature) =>
    signature.parts.every((part) =>
      part.bytes.every((byte, index) => bytes[part.offset + index] === byte),
    ),
  ).map((signature) => signature.format);

  if (hasRtfPrefix(bytes)) {
    matched.push('rtf');
  }

  return [...new Set(matched)];
}

/** RTF is text, so its "magic" is a literal control word rather than bytes. */
export function hasRtfPrefix(bytes: Uint8Array): boolean {
  return new TextDecoder().decode(bytes.subarray(0, RTF_PREFIX.length)) === RTF_PREFIX;
}

/** The last dot onward, lowercased. A name with no dot has no extension. */
export function readExtension(fileName: string): string {
  const index = fileName.lastIndexOf('.');

  return index === -1 ? '' : fileName.slice(index).toLowerCase();
}

/** Rejects dangerous extensions hidden before an apparently safe final one. */
export function findForbiddenExtension(fileName: string): string | null {
  const normalized = fileName.toLowerCase();

  for (const extension of FORBIDDEN_EXTENSIONS) {
    const index = normalized.indexOf(extension);
    const boundary = normalized[index + extension.length];

    if (index !== -1 && (boundary === undefined || boundary === '.')) {
      return extension;
    }
  }

  return null;
}

/**
 * Extensions that are refused before anything else looks at the file.
 *
 * Belt and braces: the signature check would already refuse an executable, but
 * an upload named `cv.exe` should never reach a scanner, a parser or a
 * storage key — and a reader who sees the name in a bucket should not have to
 * work out whether it was ever opened.
 */
export function isForbiddenExtension(extension: string): boolean {
  return FORBIDDEN_EXTENSIONS.includes(extension as (typeof FORBIDDEN_EXTENSIONS)[number]);
}

export function formatsFor(kind: FileKind): FileFormatTable {
  return kind === 'image' ? IMAGE_FORMATS : DOCUMENT_FORMATS;
}

/** The content type whose extension list contains this extension. */
export function contentTypeForExtension(kind: FileKind, extension: string): string | null {
  const formats = formatsFor(kind);

  for (const [contentType, format] of Object.entries(formats)) {
    if (format.extensions.includes(extension)) {
      return contentType;
    }
  }

  return null;
}

/**
 * Whether the extension, the declared type and the bytes tell the same story.
 *
 * All three have to agree. A PDF named `.docx`, or a ZIP declared as a PDF, is
 * either a mistake or an attempt — and neither is worth guessing about when the
 * cost of refusing is one clear error message.
 */
export function isConsistent(
  kind: FileKind,
  extension: string,
  signatures: readonly string[],
): boolean {
  const contentType = contentTypeForExtension(kind, extension);

  if (contentType === null) {
    return false;
  }

  const expected = formatsFor(kind)[contentType]?.signature;

  return expected !== undefined && signatures.includes(expected);
}

/**
 * ZIP and OLE2 are containers shared by unrelated Office formats. Their magic
 * bytes prove only the container, so require the format-specific directory
 * marker before allowing a Word extension to reach a parser or storage.
 */
export function hasExpectedDocumentMarker(extension: string, bytes: Uint8Array): boolean {
  if (extension === '.docx') {
    const text = new TextDecoder('latin1').decode(bytes);
    return (
      text.includes('[Content_Types].xml') &&
      text.includes('word/document.xml') &&
      !text.includes('xl/workbook.xml')
    );
  }

  if (extension === '.doc') {
    const unicodeMarker = new TextEncoder().encode('W\0o\0r\0d\0D\0o\0c\0u\0m\0e\0n\0t\0');
    return containsBytes(bytes, unicodeMarker);
  }

  return true;
}
