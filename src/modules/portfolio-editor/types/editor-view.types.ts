import type { ReactNode } from 'react';

import type { AssetUploadAction } from '@/modules/assets';
import type { PortfolioDocument } from '@/modules/portfolio-document';
import type { ExtractionWarning } from '@/modules/resume-ingestion';

export interface EditorLabels {
  readonly identityTitle: string;
  readonly identityHint: string;
  readonly displayName: string;
  readonly headline: string;
  readonly summary: string;
  readonly location: string;
  readonly tagline: string;
  readonly availabilityEnabled: string;
  readonly availabilityNote: string;
  readonly coverLetter: string;
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

/** Which pane is visible below the `lg` breakpoint, where there is room for one. */
export type EditorMobilePane = 'forms' | 'preview';

export interface EditorShellProps {
  readonly title: string;
  readonly subtitle: string;
  readonly actions: ReactNode;
  readonly forms: ReactNode;
  readonly preview: ReactNode;
  readonly showingPreview: boolean;
  readonly onEditClick: () => void;
  readonly onPreviewClick: () => void;
  readonly mobileEditLabel: string;
  readonly mobilePreviewLabel: string;
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
  readonly uploadAssetAction: AssetUploadAction;
}
