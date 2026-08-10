import 'server-only';

import { getTranslationProvider } from '@/modules/ai/server';
import type { PortfolioDocument } from '@/modules/portfolio-document';
import { getOwnedPortfolio, portfolioCacheTag } from '@/modules/portfolios/server';
import { redactPrivatePagePasswords, restoreServerPageAccess } from '@/modules/private-page-access';
import { invalidateTagImmediately } from '@/packages/cache';

import { fingerprintTranslationSource } from '../helpers/translation-fingerprint.helper';
import {
  correctOwnedTranslationDraft,
  getOwnedTranslation,
  listOwnedTranslations as listOwnedTranslationsRepository,
  publishOwnedTranslation,
  reviewOwnedTranslation,
  saveOwnedTranslationDraft,
} from '../repositories/translation.repository';
import type { AppLocale } from '../types/locale.types';
import type { TranslationSnapshot, TranslationWriteResult } from '../types/translation.types';

export async function listOwnedTranslations(
  ownerId: string,
  portfolioId: string,
): Promise<readonly TranslationSnapshot[]> {
  const [portfolio, translations] = await Promise.all([
    getOwnedPortfolio(ownerId, portfolioId),
    listOwnedTranslationsRepository(ownerId, portfolioId),
  ]);
  if (portfolio === null) return [];
  const currentFingerprint = fingerprintTranslationSource(portfolio.draftDocument);
  return translations.map((translation) => ({
    ...translation,
    isStale: translation.sourceFingerprint !== currentFingerprint,
  }));
}

export async function generateTranslationDraft(
  ownerId: string,
  portfolioId: string,
  locale: Exclude<AppLocale, 'en'>,
): Promise<TranslationWriteResult> {
  const portfolio = await getOwnedPortfolio(ownerId, portfolioId);
  if (portfolio === null) return { ok: false, reason: 'not-found' };
  const translated = await getTranslationProvider().translatePortfolio({
    document: redactPrivatePagePasswords(portfolio.draftDocument),
    targetLocale: locale,
  });
  if (!translated.ok) return { ok: false, reason: 'ai-failed' };
  const saved = await saveOwnedTranslationDraft(
    ownerId,
    portfolioId,
    locale,
    restoreServerPageAccess(translated.value, portfolio.draftDocument),
    fingerprintTranslationSource(portfolio.draftDocument),
  );
  return saved === null ? { ok: false, reason: 'not-found' } : { ok: true, value: saved };
}

export async function correctTranslationDraft(
  ownerId: string,
  portfolioId: string,
  locale: Exclude<AppLocale, 'en'>,
  expectedVersion: number,
  document: PortfolioDocument,
): Promise<TranslationWriteResult> {
  const [current, portfolio] = await Promise.all([
    getOwnedTranslation(ownerId, portfolioId, locale),
    getOwnedPortfolio(ownerId, portfolioId),
  ]);
  if (
    current === null ||
    portfolio === null ||
    current.sourceFingerprint !== fingerprintTranslationSource(portfolio.draftDocument)
  )
    return { ok: false, reason: 'not-found' };
  const saved = await correctOwnedTranslationDraft(
    ownerId,
    portfolioId,
    locale,
    expectedVersion,
    document,
  );
  return saved === null ? { ok: false, reason: 'not-found' } : { ok: true, value: saved };
}

export async function markTranslationReviewed(
  ownerId: string,
  portfolioId: string,
  locale: Exclude<AppLocale, 'en'>,
  expectedVersion: number,
  reviewedAt: Date,
): Promise<TranslationWriteResult> {
  const [portfolio, current] = await Promise.all([
    getOwnedPortfolio(ownerId, portfolioId),
    getOwnedTranslation(ownerId, portfolioId, locale),
  ]);
  if (
    portfolio === null ||
    current?.sourceFingerprint !== fingerprintTranslationSource(portfolio.draftDocument)
  )
    return { ok: false, reason: 'not-found' };
  const saved = await reviewOwnedTranslation(
    ownerId,
    portfolioId,
    locale,
    expectedVersion,
    reviewedAt,
  );
  return saved === null ? { ok: false, reason: 'not-found' } : { ok: true, value: saved };
}

export async function publishTranslationSnapshot(
  ownerId: string,
  portfolioId: string,
  locale: Exclude<AppLocale, 'en'>,
  expectedVersion: number,
  publishedAt: Date,
): Promise<TranslationWriteResult> {
  const current = await getOwnedTranslation(ownerId, portfolioId, locale);
  if (current?.draftVersion !== expectedVersion) return { ok: false, reason: 'not-found' };
  if (current.reviewedDocument === null) return { ok: false, reason: 'not-reviewed' };
  const portfolio = await getOwnedPortfolio(ownerId, portfolioId);
  if (
    portfolio === null ||
    current.sourceFingerprint !== fingerprintTranslationSource(portfolio.draftDocument)
  ) {
    return { ok: false, reason: 'not-reviewed' };
  }
  const saved = await publishOwnedTranslation(
    ownerId,
    portfolioId,
    locale,
    current.reviewedDocument,
    publishedAt,
  );
  if (saved !== null) {
    const portfolio = await getOwnedPortfolio(ownerId, portfolioId);
    if (portfolio !== null) invalidateTagImmediately(portfolioCacheTag(portfolio.slug));
  }
  return saved === null ? { ok: false, reason: 'not-found' } : { ok: true, value: saved };
}
