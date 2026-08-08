import type { PortfolioDocument } from '@/modules/portfolio-document';
import type { PublishBlocker } from '@/modules/publishing';

export interface SaveDraftPayload {
  readonly portfolioId: string;
  readonly expectedVersion: number;
  readonly document: PortfolioDocument;
}

export interface EditorActionState {
  readonly status: 'idle' | 'saved' | 'published' | 'unpublished' | 'error';
  /** A message key in the `editor` namespace, never a raw sentence. */
  readonly error: string | null;
  /** The server's current draft version, so a conflicted client can reconcile. */
  readonly version: number | null;
  readonly blockers?: readonly PublishBlocker[];
  readonly slug?: string;
}
