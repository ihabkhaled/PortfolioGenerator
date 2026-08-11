import type { ReactNode } from 'react';

import type { PortfolioDocument } from '@/modules/portfolio-document';
import type { PublishBlocker } from '@/modules/publishing';

export interface EditorDisclosureProps {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}

export interface RequiredFieldLabelProps {
  readonly htmlFor: string;
  readonly label: string;
  readonly requiredLabel: string;
}

export interface SaveDraftPayload {
  readonly portfolioId: string;
  readonly expectedVersion: number;
  readonly document: PortfolioDocument;
}

export interface EditorIssue {
  readonly path: readonly (string | number)[];
  readonly code: string;
}

export interface EditorIssueTarget {
  readonly controlId: string;
  readonly disclosureIds: readonly string[];
}

export interface EditorIssueNavigatorProps {
  readonly targets: readonly EditorIssueTarget[];
  readonly countLabel: string;
  readonly previousLabel: string;
  readonly nextLabel: string;
  readonly message: string;
  readonly generalIssues: readonly EditorIssue[];
  readonly generalTitle: string;
  readonly onNavigate?: () => void;
}

export interface EditorActionState {
  readonly status: 'idle' | 'saved' | 'published' | 'unpublished' | 'error';
  /** A message key in the `editor` namespace, never a raw sentence. */
  readonly error: string | null;
  readonly issues?: readonly EditorIssue[];
  /** The server's current draft version, so a conflicted client can reconcile. */
  readonly version: number | null;
  readonly blockers?: readonly PublishBlocker[];
  readonly slug?: string;
}
