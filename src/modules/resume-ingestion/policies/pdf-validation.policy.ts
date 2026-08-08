import { PDF_MAGIC_BYTES } from '@/shared/constants/security.constants';

import { ENCRYPTED_PDF_MARKER, PDF_HEADER_SEARCH_WINDOW } from '../constants/ingestion.constants';
import type { UploadRejection } from '../types/ingestion.types';
import type { UploadValidationInput } from '../types/upload-validation.types';

/**
 * What the bytes actually are, not what the browser said they were.
 *
 * `file.type` is client-supplied and trivially forged, so it is treated as a
 * hint for the error message and nothing else. Every accept/reject decision
 * here reads the bytes.
 */

export function hasPdfSignature(bytes: Uint8Array): boolean {
  // The header is usually at offset 0, but the specification tolerates leading
  // junk and real-world exports contain it, so a bounded scan is more accurate
  // than an exact prefix check — and still bounded, so a large file cannot turn
  // this into a scan of the whole upload.
  const limit = Math.min(bytes.length, PDF_HEADER_SEARCH_WINDOW);

  for (let offset = 0; offset + PDF_MAGIC_BYTES.length <= limit; offset += 1) {
    if (PDF_MAGIC_BYTES.every((byte, index) => bytes[offset + index] === byte)) {
      return true;
    }
  }

  return false;
}

/**
 * Detect an encrypted PDF cheaply.
 *
 * An encrypted document has an `/Encrypt` entry in its trailer. Finding it here
 * lets the user be told "this file is password-protected" instead of watching
 * extraction fail with nothing useful to act on.
 */
export function looksEncrypted(bytes: Uint8Array): boolean {
  const marker = ENCRYPTED_PDF_MARKER;
  const limit = bytes.length - marker.length;

  for (let offset = 0; offset <= limit; offset += 1) {
    if (marker.every((byte, index) => bytes[offset + index] === byte)) {
      return true;
    }
  }

  return false;
}

/**
 * The gate every upload passes before a byte is stored.
 *
 * Order matters and is deliberate: size first (cheapest, and the one an
 * attacker would use to make the others expensive), then signature, then
 * encryption.
 */
export function validateUpload(input: UploadValidationInput): UploadRejection | null {
  if (input.sizeBytes === 0) {
    return 'empty';
  }

  if (input.sizeBytes > input.maxBytes) {
    return 'too-large';
  }

  if (!hasPdfSignature(input.bytes)) {
    return 'not-a-pdf';
  }

  if (looksEncrypted(input.bytes)) {
    return 'encrypted';
  }

  return null;
}
