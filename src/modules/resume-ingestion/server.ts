import 'server-only';

/** Server-only surface: the import pipeline and owner-scoped upload access. */

export {
  countImportsToday,
  createResumeUpload,
  findOwnedUploadByHash,
  getLatestOwnedUpload,
  getOwnedResumeUpload,
  listOwnedUploadKeys,
  softDeleteOwnedUpload,
  updateOwnedResumeUpload,
} from './repositories/resume-upload.repository';
export { importResume } from './services/resume-import.service';
export type {
  CreateResumeUploadInput,
  ResumeUploadRecord,
  UpdateResumeUploadInput,
} from './types/resume-upload.types';
export type { ResumeImportOutcome, ResumeImportRequest } from './types/resume-import.types';
