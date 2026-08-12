import type { PortfolioDocument } from '@/modules/portfolio-document';

import type { AppLocale } from './locale.types';

export interface TranslationSnapshot {
  readonly id: string;
  readonly portfolioId: string;
  readonly locale: AppLocale;
  readonly draftDocument: PortfolioDocument;
  readonly draftVersion: number;
  readonly sourceFingerprint: string;
  readonly isStale: boolean;
  readonly reviewedDocument: PortfolioDocument | null;
  readonly reviewedAt: Date | null;
  readonly publishedDocument: PortfolioDocument | null;
  readonly publishedVersion: number;
  readonly publishedAt: Date | null;
}

export type TranslationWriteResult =
  | { readonly ok: true; readonly value: TranslationSnapshot }
  | {
      readonly ok: false;
      readonly reason: 'not-found' | 'not-reviewed' | 'ai-failed' | 'quota-exceeded';
    };

export type TranslationFailureReason = Extract<
  TranslationWriteResult,
  { readonly ok: false }
>['reason'];

export interface TranslationActionState {
  readonly status: 'idle' | 'success' | 'error';
  readonly error: string | null;
}

export interface TranslationActionInput {
  readonly portfolioId: FormDataEntryValue | null;
  readonly locale: FormDataEntryValue | null;
}

export interface TranslationCorrectionInput extends TranslationActionInput {
  readonly expectedVersion: FormDataEntryValue | null;
  readonly document: FormDataEntryValue | null;
}

export interface TranslationRow {
  readonly id: string;
  readonly portfolioId: string;
  readonly locale: string;
  readonly draftDocument: unknown;
  readonly draftVersion: number;
  readonly sourceFingerprint: string;
  readonly reviewedDocument: unknown;
  readonly reviewedAt: Date | null;
  readonly publishedDocument: unknown;
  readonly publishedVersion: number;
  readonly publishedAt: Date | null;
}

export interface ReviewSnapshot<TDocument> {
  readonly reviewedDocument: TDocument | null;
}

export interface TranslationSnapshots<TDocument> extends ReviewSnapshot<TDocument> {
  readonly draftDocument: TDocument;
  readonly publishedDocument: TDocument | null;
}
