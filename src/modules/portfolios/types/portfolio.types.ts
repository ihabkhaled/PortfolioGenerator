import type { PortfolioDocument } from '@/modules/portfolio-document';

export type PortfolioStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED';

/** A portfolio as the dashboard sees it: draft content plus publication state. */
export interface OwnedPortfolio {
  readonly id: string;
  readonly ownerId: string;
  readonly slug: string;
  readonly status: PortfolioStatus;
  readonly templateId: string;
  readonly draftDocument: PortfolioDocument;
  readonly draftVersion: number;
  readonly hasPublishedVersion: boolean;
  readonly publishedVersion: number;
  readonly publishedAt: Date | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** A portfolio as an anonymous visitor sees it: the published snapshot only. */
export interface PublishedPortfolio {
  readonly id: string;
  readonly slug: string;
  readonly publishedVersion: number;
  readonly publishedAt: Date;
  readonly document: PortfolioDocument;
}

export interface PublishedPortfolioTranslation {
  readonly slug: string;
  readonly locale: string;
  readonly document: PortfolioDocument;
  readonly publishedAt: Date;
}

export interface PortfolioSummary {
  readonly id: string;
  readonly slug: string;
  readonly status: PortfolioStatus;
  readonly displayName: string;
  readonly headline: string | null;
  readonly updatedAt: Date;
  readonly publishedAt: Date | null;
}

export interface CreatePortfolioInput {
  readonly ownerId: string;
  readonly slug: string;
  readonly displayName: string;
}

export interface SaveDraftInput {
  readonly ownerId: string;
  readonly portfolioId: string;
  readonly expectedVersion: number;
  readonly document: PortfolioDocument;
}

/**
 * Why a write was refused.
 *
 * `version-conflict` is separate from `not-found` on purpose: the first is
 * recoverable by reloading, the second means the caller is looking at another
 * tenant's id (or a deleted one) and must not be told which.
 */
export type PortfolioWriteFailure =
  | { readonly reason: 'not-found' }
  | { readonly reason: 'version-conflict'; readonly currentVersion: number }
  | { readonly reason: 'slug-taken' }
  | { readonly reason: 'invalid-document'; readonly detail: string };

export type PortfolioWriteResult<TValue> =
  { readonly ok: true; readonly value: TValue } | ({ readonly ok: false } & PortfolioWriteFailure);

/**
 * The outcome of `setPortfolioSuspension`: just enough for a caller to
 * invalidate the right public cache tag, deliberately not the full
 * `OwnedPortfolio` shape a dashboard write returns.
 */
export type PortfolioSuspensionOutcome =
  { readonly ok: true; readonly slug: string } | { readonly ok: false };
