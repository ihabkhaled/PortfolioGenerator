import 'server-only';

import { getAiProvider } from '@/modules/ai/server';
import { getOwnedPortfolio, portfolioCacheTag } from '@/modules/portfolios/server';
import { redactPrivatePagePasswords, restoreServerPageAccess } from '@/modules/private-page-access';
import { invalidateTagImmediately } from '@/packages/cache';

import {
  getOwnedTranslation,
  publishOwnedTranslation,
  reviewOwnedTranslation,
  saveOwnedTranslationDraft,
} from '../repositories/translation.repository';
import type { AppLocale } from '../types/locale.types';
import type { TranslationWriteResult } from '../types/translation.types';

export { listOwnedTranslations } from '../repositories/translation.repository';

export async function generateTranslationDraft(
  ownerId: string,
  portfolioId: string,
  locale: Exclude<AppLocale, 'en'>,
): Promise<TranslationWriteResult> {
  const portfolio = await getOwnedPortfolio(ownerId, portfolioId);
  if (portfolio === null) return { ok: false, reason: 'not-found' };
  const translated = await getAiProvider().translatePortfolio({
    document: redactPrivatePagePasswords(portfolio.draftDocument),
    targetLocale: locale,
  });
  if (!translated.ok) return { ok: false, reason: 'ai-failed' };
  const saved = await saveOwnedTranslationDraft(
    ownerId,
    portfolioId,
    locale,
    restoreServerPageAccess(translated.value, portfolio.draftDocument),
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
  if (current === null) return { ok: false, reason: 'not-found' };
  if (current.draftVersion !== expectedVersion) return { ok: false, reason: 'not-found' };
  if (current.reviewedDocument === null) return { ok: false, reason: 'not-reviewed' };
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
