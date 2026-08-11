import type { PortfolioDocument } from '@/modules/portfolio-document';

import type { EditorIssue } from './editor.types';

export interface DraftEditorInput {
  readonly portfolioId: string;
  readonly initialDocument: PortfolioDocument;
  readonly initialVersion: number;
}

export interface DraftEditor {
  readonly document: PortfolioDocument;
  readonly version: number;
  readonly isDirty: boolean;
  readonly isSaving: boolean;
  /** A message key, or null. */
  readonly error: string | null;
  readonly issues: readonly EditorIssue[];
  readonly update: (next: PortfolioDocument) => void;
  readonly adoptVersion: (version: number) => void;
  readonly save: () => void;
}
