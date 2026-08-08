/**
 * The columns every resume-upload read selects.
 *
 * Explicit so that a column added later for authoring cannot silently start
 * travelling to places that only needed metadata.
 */
export const RESUME_UPLOAD_SELECT = {
  id: true,
  ownerId: true,
  portfolioId: true,
  storageKey: true,
  originalFilename: true,
  mimeType: true,
  sizeBytes: true,
  sha256: true,
  status: true,
  pageCount: true,
  extractedTextStorageKey: true,
  characterCount: true,
  ocrUsed: true,
  warnings: true,
  errorCode: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;
