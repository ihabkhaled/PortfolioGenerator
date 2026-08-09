import {
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_PIXELS,
  MIN_IMAGE_DIMENSION,
} from '../constants/file-signature.constants';
import type { ImageDimensions } from '../types/file-security.types';

/**
 * Read an image's dimensions from its header, without decoding it.
 *
 * Decoding an untrusted image to measure it is the vulnerability, not the
 * mitigation: image decoders are where the memory-safety bugs live. Every
 * format below states its size in a fixed header, so the size can be read from
 * a few dozen bytes and checked *before* anything decodes the pixels.
 *
 * A format this cannot read returns null, and the caller refuses the upload —
 * "we could not measure it" is not permission to store it.
 */
export function readImageDimensions(bytes: Uint8Array): ImageDimensions | null {
  return (
    readPngDimensions(bytes) ??
    readGifDimensions(bytes) ??
    readWebpDimensions(bytes) ??
    readJpegDimensions(bytes)
  );
}

export function readPngDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 24 || bytes[0] !== 0x89 || bytes[1] !== 0x50) {
    return null;
  }

  return { width: readUint32(bytes, 16), height: readUint32(bytes, 20) };
}

export function readGifDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 10 || bytes[0] !== 0x47 || bytes[1] !== 0x49 || bytes[2] !== 0x46) {
    return null;
  }

  return { width: readUint16LittleEndian(bytes, 6), height: readUint16LittleEndian(bytes, 8) };
}

/** Only the lossy `VP8 ` and lossless `VP8L`/`VP8X` chunks state a size. */
export function readWebpDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 30 || new TextDecoder().decode(bytes.subarray(8, 12)) !== 'WEBP') {
    return null;
  }

  const chunk = new TextDecoder().decode(bytes.subarray(12, 16));

  if (chunk === 'VP8X') {
    return {
      width: readUint24LittleEndian(bytes, 24) + 1,
      height: readUint24LittleEndian(bytes, 27) + 1,
    };
  }

  if (chunk === 'VP8 ') {
    return {
      width: readUint16LittleEndian(bytes, 26) & 0x3f_ff,
      height: readUint16LittleEndian(bytes, 28) & 0x3f_ff,
    };
  }

  return null;
}

/**
 * JPEG states its size in a start-of-frame marker, which can appear anywhere
 * after the header depending on how many other segments precede it. Walking the
 * segment chain is the only way to find it — and the walk is bounded, so a
 * malformed file cannot spin.
 */
export function readJpegDimensions(bytes: Uint8Array): ImageDimensions | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    /* v8 ignore next -- the loop bound keeps offset + 1 inside the buffer. */
    const marker = bytes[offset + 1] ?? 0;

    if (isStartOfFrame(marker)) {
      return { width: readUint16(bytes, offset + 7), height: readUint16(bytes, offset + 5) };
    }

    offset += 2 + readUint16(bytes, offset + 2);
  }

  return null;
}

/** SOF0–SOF15, excluding the four markers that are not frame headers. */
export function isStartOfFrame(marker: number): boolean {
  return marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
}

/**
 * Bounds that exist to stop a decompression bomb.
 *
 * A 60 000 × 60 000 PNG is a few hundred kilobytes on disk and 14 gigabytes in
 * memory. The pixel ceiling is the one that matters; the per-side ceiling
 * catches the pathological strip that slips under it.
 */
export function isWithinBounds(dimensions: ImageDimensions): boolean {
  return (
    dimensions.width >= MIN_IMAGE_DIMENSION &&
    dimensions.height >= MIN_IMAGE_DIMENSION &&
    dimensions.width <= MAX_IMAGE_DIMENSION &&
    dimensions.height <= MAX_IMAGE_DIMENSION &&
    dimensions.width * dimensions.height <= MAX_IMAGE_PIXELS
  );
}

export function isTooSmall(dimensions: ImageDimensions): boolean {
  return dimensions.width < MIN_IMAGE_DIMENSION || dimensions.height < MIN_IMAGE_DIMENSION;
}

export function readUint32(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] ?? 0) << 24) |
    ((bytes[offset + 1] ?? 0) << 16) |
    ((bytes[offset + 2] ?? 0) << 8) |
    (bytes[offset + 3] ?? 0)
  );
}

export function readUint16(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
}

export function readUint16LittleEndian(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8);
}

export function readUint24LittleEndian(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] ?? 0) | ((bytes[offset + 1] ?? 0) << 8) | ((bytes[offset + 2] ?? 0) << 16);
}
