import type { FileInspection } from '@/modules/file-security';
import type { PortfolioDocument } from '@/modules/portfolio-document';

import type { ExtractionWarning, UploadRejection } from './ingestion.types';

export interface ResumeImportRequest {
  readonly ownerId: string;
  readonly portfolioId: string;
  readonly bytes: Uint8Array;
  readonly originalFilename: string;
  /** What the browser claimed. Checked for agreement, never trusted. */
  readonly declaredContentType: string;
  /** Used when the CV has no readable name. */
  readonly displayNameFallback: string;
  /** Injected so quota windows and tests agree on "now". */
  readonly now: Date;
}

export type ResumeImportOutcome =
  | {
      readonly ok: true;
      readonly uploadId: string;
      readonly document: PortfolioDocument;
      readonly warnings: readonly ExtractionWarning[];
    }
  | {
      readonly ok: false;
      readonly rejection: UploadRejection;
      /** Absent when the upload was refused before a row existed. */
      readonly uploadId?: string;
      /** Lets the UI explain a scan specifically rather than generically. */
      readonly looksScanned?: boolean;
    };

export type ResumeImportFailure = Extract<ResumeImportOutcome, { readonly ok: false }>;

export type ResumePreflightResult =
  | ResumeImportFailure
  | { readonly ok: true; readonly inspection: Extract<FileInspection, { readonly ok: true }> };
