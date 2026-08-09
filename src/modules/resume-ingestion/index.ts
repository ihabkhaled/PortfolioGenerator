/** Public surface of the resume-ingestion module (pure policy and types). */

export {
  INGESTION_STATES,
  INGESTION_TRANSITIONS,
  SCANNED_CHARACTERS_PER_PAGE_THRESHOLD,
  UPLOAD_REJECTIONS,
} from './constants/ingestion.constants';
export { readBoundedString, readExtractionWarnings } from './helpers/extraction-warnings.helper';
export { normalizeResumeText } from './helpers/resume-text.helper';
export { addImportedResumeAttachment } from './helpers/imported-resume-attachment.helper';
export { canTransition, hasDraft, isFailure, isTerminal } from './policies/ingestion-state.policy';
export { toDocumentTextRejection } from './policies/document-text-rejection.policy';
export { toUploadRejection } from './policies/upload-rejection.policy';
export {
  hasPdfSignature,
  looksEncrypted,
  validateUpload,
  validateUploadSize,
} from './policies/pdf-validation.policy';
export type {
  ExtractionWarning,
  IngestionState,
  NormalizedResumeText,
  UploadRejection,
} from './types/ingestion.types';
export type { ImportedResumeAttachmentInput } from './types/imported-resume-attachment.types';
