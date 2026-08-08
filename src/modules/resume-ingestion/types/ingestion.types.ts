import type { INGESTION_STATES, UPLOAD_REJECTIONS } from '../constants/ingestion.constants';

export type IngestionState = (typeof INGESTION_STATES)[number];
export type UploadRejection = (typeof UPLOAD_REJECTIONS)[number];

/** A concern the user should look at, anchored to the field it concerns. */
export interface ExtractionWarning {
  readonly code: string;
  /** Dotted path into the document, e.g. `experience.0.endDate`. */
  readonly path: string;
  readonly message: string;
}

export interface NormalizedResumeText {
  readonly text: string;
  readonly characterCount: number;
  readonly pageCount: number;
  readonly looksScanned: boolean;
  readonly wasTruncated: boolean;
}
