import { describe, expect, it } from 'vitest';

import {
  contentTypeForExtension,
  containsBytes,
  findForbiddenExtension,
  hasExpectedDocumentMarker,
  detectSignatures,
  FILE_REJECTIONS,
  formatsFor,
  hasRtfPrefix,
  inspectUpload,
  inspectUploadForPurpose,
  isConsistent,
  isForbiddenExtension,
  isStartOfFrame,
  isTooSmall,
  isWithinBounds,
  MAX_IMAGE_DIMENSION,
  readExtension,
  readGifDimensions,
  readImageDimensions,
  readJpegDimensions,
  readPngDimensions,
  readUint16,
  readUint16LittleEndian,
  readUint24LittleEndian,
  readUint32,
  readWebpDimensions,
  reject,
} from '@/modules/file-security';
import { interpretClamAvResponse } from '@/packages/clamav';

/**
 * An upload is the one place a user hands the platform a file they did not
 * write. Every test here is a way that file could be something other than what
 * it claims — because the browser's content type is a claim by the uploader's
 * software and the extension is a claim by the uploader.
 */

const MAX_BYTES = 8 * 1024 * 1024;

function bytes(...values: number[]): Uint8Array {
  return Uint8Array.from(values);
}

function padded(prefix: number[], length: number): Uint8Array {
  const buffer = new Uint8Array(length);

  buffer.set(prefix, 0);

  return buffer;
}

function buildPng(width: number, height: number): Uint8Array {
  const buffer = new Uint8Array(64);

  buffer.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  new DataView(buffer.buffer).setUint32(16, width);
  new DataView(buffer.buffer).setUint32(20, height);

  return buffer;
}

function buildJpeg(width: number, height: number): Uint8Array {
  const buffer = new Uint8Array(32);
  const view = new DataView(buffer.buffer);

  buffer.set([0xff, 0xd8], 0);
  buffer.set([0xff, 0xc0], 2);
  view.setUint16(4, 17);
  view.setUint16(7, height);
  view.setUint16(9, width);

  return buffer;
}

describe('readExtension', () => {
  it.each([
    ['cv.pdf', '.pdf'],
    ['CV.PDF', '.pdf'],
    ['my.resume.docx', '.docx'],
    ['noextension', ''],
  ])('reads %s as %j', (fileName, expected) => {
    expect(readExtension(fileName)).toBe(expected);
  });
});

describe('isForbiddenExtension', () => {
  // An upload named cv.exe should never reach a scanner, a parser or a key.
  it.each(['.exe', '.js', '.svg', '.html', '.ps1'])('refuses %s outright', (extension) => {
    expect(isForbiddenExtension(extension)).toBe(true);
  });

  it.each(['.pdf', '.png', '.docx'])('allows %s', (extension) => {
    expect(isForbiddenExtension(extension)).toBe(false);
  });
});

describe('searching file names and container bytes', () => {
  it('finds dangerous extensions only at a file-name boundary', () => {
    expect(findForbiddenExtension('resume.EXE.pdf')).toBe('.exe');
    expect(findForbiddenExtension('resume.executable.pdf')).toBeNull();
    expect(findForbiddenExtension('resume.pdf')).toBeNull();
  });

  it('finds a complete byte marker and refuses empty, oversized, and partial markers', () => {
    const source = bytes(1, 2, 3, 4);

    expect(containsBytes(source, bytes(2, 3))).toBe(true);
    expect(containsBytes(source, bytes(3, 5))).toBe(false);
    expect(containsBytes(source, bytes())).toBe(false);
    expect(containsBytes(source, bytes(1, 2, 3, 4, 5))).toBe(false);
  });

  it('requires the format-specific marker for legacy Word files', () => {
    const marker = new TextEncoder().encode('W\0o\0r\0d\0D\0o\0c\0u\0m\0e\0n\0t\0');

    expect(hasExpectedDocumentMarker('.doc', marker)).toBe(true);
    expect(hasExpectedDocumentMarker('.doc', bytes(1, 2, 3))).toBe(false);
    expect(hasExpectedDocumentMarker('.pdf', bytes(1, 2, 3))).toBe(true);
  });
});

describe('detectSignatures', () => {
  it('identifies a PDF by its bytes', () => {
    expect(detectSignatures(bytes(0x25, 0x50, 0x44, 0x46, 0x2d))).toContain('pdf');
  });

  it('identifies a PNG', () => {
    expect(detectSignatures(buildPng(10, 10))).toContain('png');
  });

  // A DOCX and an XLSX are both ZIPs; the container alone cannot decide.
  it('reports a ZIP container without claiming which document it holds', () => {
    const signatures = detectSignatures(bytes(0x50, 0x4b, 0x03, 0x04));

    expect(signatures).toEqual(['zip']);
  });

  it('identifies an OLE2 compound file, which is what a .doc is', () => {
    expect(detectSignatures(bytes(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1))).toContain(
      'ole2',
    );
  });

  // WebP's marker is at byte 8, inside the RIFF container.
  it('does not call every RIFF file a WebP', () => {
    const riffOnly = padded([0x52, 0x49, 0x46, 0x46], 32);

    expect(detectSignatures(riffOnly)).not.toContain('webp');
  });

  it('identifies a real WebP', () => {
    const webp = padded([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50], 32);

    expect(detectSignatures(webp)).toContain('webp');
  });

  it('identifies RTF by its control word rather than by magic bytes', () => {
    const rtf = new TextEncoder().encode(String.raw`{\rtf1\ansi`);

    expect(hasRtfPrefix(rtf)).toBe(true);
    expect(detectSignatures(rtf)).toContain('rtf');
  });

  it('reports nothing for bytes it does not recognise', () => {
    expect(detectSignatures(bytes(0x01, 0x02, 0x03, 0x04))).toEqual([]);
  });
});

describe('the format tables', () => {
  it('maps an extension to its content type', () => {
    expect(contentTypeForExtension('document', '.pdf')).toBe('application/pdf');
    expect(contentTypeForExtension('image', '.jpeg')).toBe('image/jpeg');
  });

  it('returns nothing for an extension the kind does not accept', () => {
    expect(contentTypeForExtension('image', '.pdf')).toBeNull();
    expect(contentTypeForExtension('document', '.png')).toBeNull();
  });

  // SVG is a document that can carry script. "An image the browser executes"
  // is not a category this product accepts from an uploader.
  it('does not accept SVG as an image', () => {
    expect(contentTypeForExtension('image', '.svg')).toBeNull();
  });

  it('exposes a table per kind', () => {
    expect(Object.keys(formatsFor('image'))).toContain('image/png');
    expect(Object.keys(formatsFor('document'))).toContain('application/pdf');
  });

  it('requires the extension and the bytes to agree', () => {
    expect(isConsistent('document', '.pdf', ['pdf'])).toBe(true);
    expect(isConsistent('document', '.pdf', ['zip'])).toBe(false);
    expect(isConsistent('document', '.unknown', ['pdf'])).toBe(false);
  });
});

describe('inspectUpload', () => {
  const pdf = padded([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37], 1024);

  it('accepts a real PDF and reports the type derived from its bytes', () => {
    const result = inspectUpload(
      { fileName: 'cv.pdf', declaredContentType: 'application/pdf', bytes: pdf },
      'document',
      MAX_BYTES,
    );

    expect(result).toEqual({
      ok: true,
      contentType: 'application/pdf',
      extension: '.pdf',
      dimensions: null,
    });
  });

  it('refuses an empty file', () => {
    const result = inspectUpload(
      { fileName: 'cv.pdf', declaredContentType: 'application/pdf', bytes: new Uint8Array(0) },
      'document',
      MAX_BYTES,
    );

    expect(result).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.empty });
  });

  it('refuses a file over the limit', () => {
    const result = inspectUpload(
      { fileName: 'cv.pdf', declaredContentType: 'application/pdf', bytes: pdf },
      'document',
      16,
    );

    expect(result).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.tooLarge });
  });

  it('refuses an executable before it looks at anything else', () => {
    const result = inspectUpload(
      { fileName: 'cv.exe', declaredContentType: 'application/pdf', bytes: pdf },
      'document',
      MAX_BYTES,
    );

    expect(result).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.forbiddenExtension });
  });

  it('refuses a file with no extension at all', () => {
    const result = inspectUpload(
      { fileName: 'resume', declaredContentType: 'application/pdf', bytes: pdf },
      'document',
      MAX_BYTES,
    );

    expect(result).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.unknownExtension });
  });

  it('refuses a type this kind does not accept', () => {
    const result = inspectUpload(
      { fileName: 'cv.png', declaredContentType: 'image/png', bytes: buildPng(10, 10) },
      'document',
      MAX_BYTES,
    );

    expect(result).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.unsupportedType });
  });

  // The extension says PDF and the browser agrees; the bytes do not.
  it('refuses a text file wearing a PDF name', () => {
    const result = inspectUpload(
      {
        fileName: 'cv.pdf',
        declaredContentType: 'application/pdf',
        bytes: new TextEncoder().encode('This is not a PDF.'),
      },
      'document',
      MAX_BYTES,
    );

    expect(result).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.signatureMismatch });
  });

  it('refuses a declared type that disagrees with the extension', () => {
    const result = inspectUpload(
      { fileName: 'cv.pdf', declaredContentType: 'image/png', bytes: pdf },
      'document',
      MAX_BYTES,
    );

    expect(result).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.extensionMismatch });
  });

  // A client that sends nothing, or a generic type, is not an attack.
  it.each(['', 'application/octet-stream'])('tolerates a declared type of %j', (declared) => {
    const result = inspectUpload(
      { fileName: 'cv.pdf', declaredContentType: declared, bytes: pdf },
      'document',
      MAX_BYTES,
    );

    expect(result.ok).toBe(true);
  });

  it('accepts an image and reports its measured dimensions', () => {
    const result = inspectUpload(
      { fileName: 'photo.png', declaredContentType: 'image/png', bytes: buildPng(800, 600) },
      'image',
      MAX_BYTES,
    );

    expect(result).toMatchObject({ ok: true, dimensions: { width: 800, height: 600 } });
  });

  // "We could not measure it" is not permission to store it.
  it('refuses an image whose header it cannot read', () => {
    const unreadable = padded([0x47, 0x49, 0x46, 0x38], 6);
    const result = inspectUpload(
      { fileName: 'broken.gif', declaredContentType: 'image/gif', bytes: unreadable },
      'image',
      MAX_BYTES,
    );

    expect(result).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.imageUnreadable });
  });

  // A 60 000 × 60 000 PNG is a few hundred kilobytes on disk and gigabytes in
  // memory. The pixel ceiling is the one that matters.
  it('refuses a decompression bomb', () => {
    const result = inspectUpload(
      {
        fileName: 'bomb.png',
        declaredContentType: 'image/png',
        bytes: buildPng(MAX_IMAGE_DIMENSION + 1, MAX_IMAGE_DIMENSION + 1),
      },
      'image',
      MAX_BYTES,
    );

    expect(result).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.imageTooLarge });
  });

  it('refuses a tracking-pixel-sized image', () => {
    const result = inspectUpload(
      { fileName: 'pixel.png', declaredContentType: 'image/png', bytes: buildPng(1, 1) },
      'image',
      MAX_BYTES,
    );

    expect(result).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.imageTooSmall });
  });
});

describe('inspectUploadForPurpose', () => {
  const pdf = padded([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37], 1024);

  it('rejects a dangerous double extension even when the final extension is allowed', () => {
    const result = inspectUploadForPurpose({
      purpose: 'resume',
      fileName: 'resume.exe.pdf',
      declaredContentType: 'application/pdf',
      bytes: pdf,
    });

    expect(result).toMatchObject({
      ok: false,
      rejection: FILE_REJECTIONS.forbiddenExtension,
      detail: '.exe',
    });
  });

  it('accepts a measured image for a portrait', () => {
    const result = inspectUploadForPurpose({
      purpose: 'portrait',
      fileName: 'portrait.png',
      declaredContentType: 'image/png',
      bytes: buildPng(800, 800),
    });

    expect(result).toMatchObject({
      ok: true,
      contentType: 'image/png',
      dimensions: { width: 800, height: 800 },
    });
  });

  it('rejects a document used where a gallery image is required', () => {
    const result = inspectUploadForPurpose({
      purpose: 'gallery',
      fileName: 'portfolio.pdf',
      declaredContentType: 'application/pdf',
      bytes: pdf,
    });

    expect(result).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.unsupportedType });
  });

  it('accepts a PDF certificate but rejects an executable certificate', () => {
    expect(
      inspectUploadForPurpose({
        purpose: 'certificate',
        fileName: 'certificate.pdf',
        declaredContentType: 'application/pdf',
        bytes: pdf,
      }).ok,
    ).toBe(true);

    expect(
      inspectUploadForPurpose({
        purpose: 'certificate',
        fileName: 'certificate.exe',
        declaredContentType: 'application/octet-stream',
        bytes: pdf,
      }),
    ).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.forbiddenExtension });
  });

  it('accepts Word containers only when their internal document markers agree', () => {
    const docx = new TextEncoder().encode(
      `PK\u{3}\u{4}[Content_Types].xml word/document.xml application/vnd.openxmlformats-officedocument.wordprocessingml.document`,
    );
    const xlsx = new TextEncoder().encode(`PK\u{3}\u{4}[Content_Types].xml xl/workbook.xml`);

    expect(
      inspectUploadForPurpose({
        purpose: 'resume',
        fileName: 'resume.docx',
        declaredContentType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        bytes: docx,
      }).ok,
    ).toBe(true);
    expect(
      inspectUploadForPurpose({
        purpose: 'resume',
        fileName: 'spreadsheet.docx',
        declaredContentType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        bytes: xlsx,
      }),
    ).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.signatureMismatch });
  });

  it('applies a smaller byte ceiling to portraits than general attachments', () => {
    const oversizedPortrait = new Uint8Array(5 * 1024 * 1024 + 1);

    oversizedPortrait.set(buildPng(800, 800));

    expect(
      inspectUploadForPurpose({
        purpose: 'portrait',
        fileName: 'portrait.png',
        declaredContentType: 'image/png',
        bytes: oversizedPortrait,
      }),
    ).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.tooLarge });
  });
});

describe('reading dimensions without decoding', () => {
  it('reads a PNG header', () => {
    expect(readPngDimensions(buildPng(1920, 1080))).toEqual({ width: 1920, height: 1080 });
  });

  it('walks a JPEG to its start-of-frame marker', () => {
    expect(readJpegDimensions(buildJpeg(640, 480))).toEqual({ width: 640, height: 480 });
  });

  it('reads a GIF header', () => {
    const gif = padded([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x20, 0x00, 0x10, 0x00], 16);

    expect(readGifDimensions(gif)).toEqual({ width: 32, height: 16 });
  });

  it('reads an extended WebP header', () => {
    const webp = new Uint8Array(64);

    webp.set(new TextEncoder().encode('RIFF'), 0);
    webp.set(new TextEncoder().encode('WEBP'), 8);
    webp.set(new TextEncoder().encode('VP8X'), 12);
    webp.set([0x3f, 0x00, 0x00], 24);
    webp.set([0x1f, 0x00, 0x00], 27);

    expect(readWebpDimensions(webp)).toEqual({ width: 64, height: 32 });
  });

  it('dispatches on the format it finds', () => {
    expect(readImageDimensions(buildPng(300, 200))).toEqual({ width: 300, height: 200 });
    expect(readImageDimensions(buildJpeg(300, 200))).toEqual({ width: 300, height: 200 });
  });

  it.each([
    ['a truncated PNG', new Uint8Array(4)],
    ['bytes of no known format', bytes(1, 2, 3, 4, 5, 6, 7, 8, 9, 10)],
  ])('returns nothing for %s', (_label, value) => {
    expect(readImageDimensions(value)).toBeNull();
  });

  it('returns nothing for a WebP whose chunk states no size', () => {
    const webp = new Uint8Array(64);

    webp.set(new TextEncoder().encode('RIFF'), 0);
    webp.set(new TextEncoder().encode('WEBP'), 8);
    webp.set(new TextEncoder().encode('VP8L'), 12);

    expect(readWebpDimensions(webp)).toBeNull();
  });

  it('returns nothing for a JPEG with no frame header', () => {
    const jpeg = new Uint8Array(32);

    jpeg.set([0xff, 0xd8], 0);

    expect(readJpegDimensions(jpeg)).toBeNull();
  });

  it('distinguishes a frame header from the other markers in its range', () => {
    expect(isStartOfFrame(0xc0)).toBe(true);
    expect(isStartOfFrame(0xc4)).toBe(false);
    expect(isStartOfFrame(0xd8)).toBe(false);
  });

  it('bounds what it will accept', () => {
    expect(isWithinBounds({ width: 1000, height: 1000 })).toBe(true);
    expect(isWithinBounds({ width: 60_000, height: 60_000 })).toBe(false);
    expect(isTooSmall({ width: 2, height: 2 })).toBe(true);
  });

  it('reads the integer widths each format uses', () => {
    expect(readUint32(bytes(0, 0, 1, 0), 0)).toBe(256);
    expect(readUint16(bytes(1, 0), 0)).toBe(256);
    expect(readUint16LittleEndian(bytes(0, 1), 0)).toBe(256);
    expect(readUint24LittleEndian(bytes(0, 0, 1), 0)).toBe(65_536);
  });

  it('reads a zero when the buffer ends early', () => {
    expect(readUint32(new Uint8Array(0), 0)).toBe(0);
  });
});

describe('reject', () => {
  it('builds a refusal carrying its reason', () => {
    expect(reject(FILE_REJECTIONS.infected, 'Eicar-Test-Signature')).toEqual({
      ok: false,
      rejection: 'infected',
      detail: 'Eicar-Test-Signature',
    });
  });
});

describe('interpretClamAvResponse', () => {
  it('reads a clean verdict', () => {
    expect(interpretClamAvResponse('stream: OK ')).toEqual({ status: 'clean' });
  });

  it('reads a detection and keeps the signature name', () => {
    expect(interpretClamAvResponse('stream: Eicar-Test-Signature FOUND ')).toEqual({
      status: 'infected',
      signature: 'Eicar-Test-Signature',
    });
  });

  it('reports a size limit as unavailable rather than as clean', () => {
    expect(interpretClamAvResponse('INSTREAM size limit exceeded. ERROR')).toEqual({
      status: 'unavailable',
      reason: 'size-limit',
    });
  });

  // An unparsed answer is not evidence a file is safe, and reading it as one is
  // how a scanner stops scanning without anyone noticing.
  it.each([
    ['an empty response', '', 'empty-response'],
    ['something it does not recognise', 'WHAT', 'unrecognised'],
  ])('reports %s as unavailable', (_label, response, reason) => {
    expect(interpretClamAvResponse(response)).toEqual({ status: 'unavailable', reason });
  });

  it('names an unknown signature rather than returning an empty string', () => {
    expect(interpretClamAvResponse('FOUND')).toEqual({ status: 'infected', signature: 'unknown' });
  });
});

describe('image headers that are damaged rather than absent', () => {
  it('returns nothing for a GIF header that ends before its size', () => {
    expect(readGifDimensions(Uint8Array.from([0x47, 0x49, 0x46, 0x38]))).toBeNull();
  });

  it('returns nothing for a WebP whose RIFF header is truncated', () => {
    expect(readWebpDimensions(Uint8Array.from([0x52, 0x49, 0x46, 0x46]))).toBeNull();
  });

  it('returns nothing for bytes that are not a GIF at all', () => {
    expect(readGifDimensions(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]))).toBeNull();
  });

  it('returns nothing for bytes that are not a JPEG at all', () => {
    expect(readJpegDimensions(Uint8Array.from([1, 2, 3, 4]))).toBeNull();
  });

  it('returns nothing for a PNG header that ends before its size', () => {
    expect(readPngDimensions(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
  });

  // A byte stream full of `FF` would spin a naive scanner; the walk is bounded.
  it('gives up on a JPEG whose segment chain never reaches a frame', () => {
    const noisy = new Uint8Array(64).fill(0xff);

    noisy.set([0xff, 0xd8], 0);

    expect(readJpegDimensions(noisy)).toBeNull();
  });

  it('skips a byte that is not a marker while walking a JPEG', () => {
    const jpeg = new Uint8Array(40);
    const view = new DataView(jpeg.buffer);

    jpeg.set([0xff, 0xd8], 0);
    jpeg.set([0x00, 0x00], 2);
    jpeg.set([0xff, 0xc0], 4);
    view.setUint16(6, 17);
    view.setUint16(9, 200);
    view.setUint16(11, 300);

    expect(readJpegDimensions(jpeg)).toEqual({ width: 300, height: 200 });
  });

  it('rejects a side beyond the per-side ceiling even under the pixel ceiling', () => {
    expect(isWithinBounds({ width: MAX_IMAGE_DIMENSION + 1, height: 10 })).toBe(false);
  });

  it('accepts an image at exactly the smallest allowed size', () => {
    expect(isTooSmall({ width: 8, height: 8 })).toBe(false);
  });
});

describe('the header readers on partial input', () => {
  it.each([
    ['a big-endian 16-bit read', readUint16],
    ['a little-endian 16-bit read', readUint16LittleEndian],
    ['a little-endian 24-bit read', readUint24LittleEndian],
  ])('reads a zero rather than NaN when %s runs off the end', (_label, read) => {
    expect(read(new Uint8Array(0), 0)).toBe(0);
  });

  // Long enough to measure, wrong from the second byte onward.
  it('refuses a long buffer whose GIF marker is only partly right', () => {
    const almost = new Uint8Array(16);

    almost.set([0x47, 0x00, 0x46, 0x38], 0);

    expect(readGifDimensions(almost)).toBeNull();
  });

  it('refuses a long RIFF container that is not a WebP', () => {
    const wav = new Uint8Array(64);

    wav.set(new TextEncoder().encode('RIFF'), 0);
    wav.set(new TextEncoder().encode('WAVE'), 8);

    expect(readWebpDimensions(wav)).toBeNull();
  });
});

describe('the lossy WebP chunk', () => {
  it('reads a VP8 header and masks the reserved bits', () => {
    const webp = new Uint8Array(64);

    webp.set(new TextEncoder().encode('RIFF'), 0);
    webp.set(new TextEncoder().encode('WEBP'), 8);
    webp.set(new TextEncoder().encode('VP8 '), 12);
    webp.set([0x40, 0x01], 26);
    webp.set([0xf0, 0x00], 28);

    expect(readWebpDimensions(webp)).toEqual({ width: 320, height: 240 });
  });
});

describe('purpose inspection without a recognizable extension', () => {
  it('reports no extension detail when the filename has no suffix', () => {
    expect(
      inspectUploadForPurpose({
        purpose: 'resume',
        fileName: 'resume',
        declaredContentType: 'application/octet-stream',
        bytes: new Uint8Array(32),
      }),
    ).toMatchObject({ ok: false, rejection: FILE_REJECTIONS.unsupportedType, detail: null });
  });
});
