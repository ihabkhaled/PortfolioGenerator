import type { PortfolioDocument, PortfolioSection } from '@/modules/portfolio-document';
import type { ExtractionWarning } from '@/modules/resume-ingestion';

export interface ExtractionMappingResult {
  readonly document: PortfolioDocument;
  readonly warnings: ExtractionWarning[];
}

export interface ImportedPageDefinition {
  readonly slug: string;
  readonly title: string;
  readonly sectionTypes: readonly PortfolioSection['type'][];
}
