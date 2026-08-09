import { FILE_REJECTIONS } from '../constants/file-security.constants';
import type {
  FileInspection,
  FileKind,
  FileRejection,
  UploadCandidate,
} from '../types/file-security.types';

import {
  contentTypeForExtension,
  detectSignatures,
  isConsistent,
  isForbiddenExtension,
  readExtension,
} from './file-signature.policy';
import { isTooSmall, isWithinBounds, readImageDimensions } from './image-dimensions.policy';

/**
 * Everything that can be decided from the bytes alone, in the order that fails
 * fastest and leaks least.
 *
 * The extension is checked before anything opens the file, the signature before
 * anything measures it, and the dimensions before anything stores it. A virus
 * scan is deliberately *not* here: it is the only step that needs a network
 * call, and separating it means an upload that is obviously wrong never costs
 * one.
 */
export function inspectUpload(
  candidate: UploadCandidate,
  kind: FileKind,
  maxBytes: number,
): FileInspection {
  if (candidate.bytes.length === 0) {
    return reject(FILE_REJECTIONS.empty, null);
  }

  if (candidate.bytes.length > maxBytes) {
    return reject(FILE_REJECTIONS.tooLarge, String(candidate.bytes.length));
  }

  const extension = readExtension(candidate.fileName);

  if (isForbiddenExtension(extension)) {
    return reject(FILE_REJECTIONS.forbiddenExtension, extension);
  }

  if (extension === '') {
    return reject(FILE_REJECTIONS.unknownExtension, null);
  }

  const contentType = contentTypeForExtension(kind, extension);

  if (contentType === null) {
    return reject(FILE_REJECTIONS.unsupportedType, extension);
  }

  const signatures = detectSignatures(candidate.bytes);

  if (!isConsistent(kind, extension, signatures)) {
    return reject(FILE_REJECTIONS.signatureMismatch, signatures.join(',') || 'none');
  }

  // The browser's claim only has to *agree*; it never gets to decide. A client
  // that sends nothing, or sends `application/octet-stream`, is not an attack.
  if (
    candidate.declaredContentType !== '' &&
    candidate.declaredContentType !== 'application/octet-stream' &&
    candidate.declaredContentType !== contentType
  ) {
    return reject(FILE_REJECTIONS.extensionMismatch, candidate.declaredContentType);
  }

  if (kind === 'document') {
    return { ok: true, contentType, extension, dimensions: null };
  }

  const dimensions = readImageDimensions(candidate.bytes);

  // "We could not measure it" is not permission to store it.
  if (dimensions === null) {
    return reject(FILE_REJECTIONS.imageUnreadable, null);
  }

  if (isTooSmall(dimensions)) {
    return reject(FILE_REJECTIONS.imageTooSmall, `${dimensions.width}x${dimensions.height}`);
  }

  if (!isWithinBounds(dimensions)) {
    return reject(FILE_REJECTIONS.imageTooLarge, `${dimensions.width}x${dimensions.height}`);
  }

  return { ok: true, contentType, extension, dimensions };
}

export function reject(rejection: FileRejection, detail: string | null): FileInspection {
  return { ok: false, rejection, detail };
}
