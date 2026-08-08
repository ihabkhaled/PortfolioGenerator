import type { PortfolioDocument } from '@/modules/portfolio-document';
import type { ExtractionWarning } from '@/modules/resume-ingestion';

export interface ExtractionRequest {
  readonly ownerId: string;
  readonly portfolioId: string;
  readonly resumeUploadId: string;
  /** Already normalized and capped by the ingestion pipeline. */
  readonly resumeText: string;
  /** Used when the CV has no readable name — the account's own name. */
  readonly displayNameFallback: string;
  /** Warnings raised before the model ran, e.g. a truncated or scanned document. */
  readonly pipelineWarnings: readonly ExtractionWarning[];
}

export type ExtractionOutcome =
  | {
      readonly ok: true;
      readonly document: PortfolioDocument;
      readonly warnings: readonly ExtractionWarning[];
    }
  | { readonly ok: false; readonly errorCode: string };
