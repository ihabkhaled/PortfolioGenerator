import type { IngestionState } from './ingestion.types';

/** The stored shape of an upload, as the repository selects it. */
export interface ResumeUploadRecord {
  readonly id: string;
  readonly ownerId: string;
  readonly portfolioId: string;
  readonly storageKey: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly sha256: string;
  readonly status: string;
  readonly pageCount: number | null;
  readonly extractedTextStorageKey: string | null;
  readonly characterCount: number | null;
  readonly ocrUsed: boolean;
  readonly warnings: unknown;
  readonly errorCode: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

export interface CreateResumeUploadInput {
  readonly ownerId: string;
  readonly portfolioId: string;
  readonly storageKey: string;
  readonly originalFilename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly sha256: string;
  readonly status: IngestionState;
}

export interface UpdateResumeUploadInput {
  readonly status?: IngestionState;
  readonly pageCount?: number | null;
  readonly extractedTextStorageKey?: string | null;
  readonly characterCount?: number | null;
  readonly ocrUsed?: boolean;
  readonly warnings?: unknown;
  readonly errorCode?: string | null;
}
