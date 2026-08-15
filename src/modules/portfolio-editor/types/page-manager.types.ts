import type { PortfolioDocument } from '@/modules/portfolio-document';

export interface PageManagerProps {
  readonly portfolioId: string;
  readonly expectedVersion: number;
  readonly document: PortfolioDocument;
  readonly importedPageOrder?: readonly string[] | null;
  readonly onChange: (document: PortfolioDocument) => void;
  readonly onVersionChange: (version: number) => void;
}
