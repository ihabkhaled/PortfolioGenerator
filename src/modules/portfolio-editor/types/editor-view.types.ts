import type { ReactNode } from 'react';

import type { PortfolioDocument } from '@/modules/portfolio-document';
import type { ExtractionWarning } from '@/modules/resume-ingestion';

export interface EditorLabels {
  readonly identityTitle: string;
  readonly identityHint: string;
  readonly displayName: string;
  readonly headline: string;
  readonly summary: string;
  readonly location: string;
  readonly contactTitle: string;
  readonly contactHint: string;
  readonly email: string;
  readonly phone: string;
  readonly phoneCountry: string;
  readonly phoneCountryNone: string;
  readonly showPublicly: string;
  readonly seoTitle: string;
  readonly seoHint: string;
  readonly seoTitleField: string;
  readonly seoDescriptionField: string;
  readonly indexable: string;
  readonly save: string;
  readonly saving: string;
  readonly saved: string;
  readonly unsaved: string;
  readonly warningsTitle: string;
}

export interface EditorShellProps {
  readonly title: string;
  readonly subtitle: string;
  readonly actions: ReactNode;
  readonly forms: ReactNode;
  readonly preview: ReactNode;
}

export interface WarningListProps {
  readonly title: string;
  readonly warnings: readonly ExtractionWarning[];
}

export interface EditorContainerProps {
  readonly portfolioId: string;
  readonly initialDocument: PortfolioDocument;
  readonly initialVersion: number;
  readonly labels: EditorLabels;
  readonly warnings: readonly ExtractionWarning[];
}
