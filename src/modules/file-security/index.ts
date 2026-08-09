/** Public surface of the file-security module (pure policy and types). */

export {
  FILE_REJECTIONS,
  SCAN_OUTCOMES,
  UPLOAD_PURPOSE_POLICIES,
} from './constants/file-security.constants';
export {
  DOCUMENT_FORMATS,
  FORBIDDEN_EXTENSIONS,
  IMAGE_FORMATS,
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_PIXELS,
  MIN_IMAGE_DIMENSION,
} from './constants/file-signature.constants';
export { inspectUpload, inspectUploadForPurpose, reject } from './policies/file-inspection.policy';
export { containsBytes } from './helpers/byte-search.helper';
export {
  contentTypeForExtension,
  detectSignatures,
  findForbiddenExtension,
  formatsFor,
  hasRtfPrefix,
  hasExpectedDocumentMarker,
  isConsistent,
  isForbiddenExtension,
  readExtension,
} from './policies/file-signature.policy';
export {
  isStartOfFrame,
  isTooSmall,
  isWithinBounds,
  readGifDimensions,
  readImageDimensions,
  readJpegDimensions,
  readPngDimensions,
  readUint16,
  readUint16LittleEndian,
  readUint24LittleEndian,
  readUint32,
  readWebpDimensions,
} from './policies/image-dimensions.policy';
export { createDisabledScanner } from './providers/disabled-scanner.provider';
export type {
  FileInspection,
  FileKind,
  FileRejection,
  ImageDimensions,
  PurposeUploadCandidate,
  UploadCandidate,
  UploadPurpose,
  UploadPurposePolicy,
} from './types/file-security.types';
export type { FileScanner, ScanOutcome, ScanResult } from './types/scanner.types';
