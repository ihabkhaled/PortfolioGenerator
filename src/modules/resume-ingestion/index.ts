/** Public surface of the resume-ingestion module (pure policy and types). */

export {
  INGESTION_STATES,
  INGESTION_TRANSITIONS,
  SCANNED_CHARACTERS_PER_PAGE_THRESHOLD,
  UPLOAD_REJECTIONS,
} from './constants/ingestion.constants';
export { readBoundedString, readExtractionWarnings } from './helpers/extraction-warnings.helper';
export { normalizeResumeText } from './helpers/resume-text.helper';
export { canTransition, hasDraft, isFailure, isTerminal } from './policies/ingestion-state.policy';
export { hasPdfSignature, looksEncrypted, validateUpload } from './policies/pdf-validation.policy';
export type {
  ExtractionWarning,
  IngestionState,
  NormalizedResumeText,
  UploadRejection,
} from './types/ingestion.types';
