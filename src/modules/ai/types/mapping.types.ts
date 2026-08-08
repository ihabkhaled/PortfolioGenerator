import type { PortfolioDocument } from '@/modules/portfolio-document';
import type { ExtractionWarning } from '@/modules/resume-ingestion';

export interface ExtractionMappingResult {
  readonly document: PortfolioDocument;
  readonly warnings: ExtractionWarning[];
}
