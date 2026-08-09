import 'server-only';

import type { PortfolioDocument } from '@/modules/portfolio-document';
import { DbNull, getDatabase } from '@/packages/database';

import { TRANSLATION_SELECT } from '../constants/translation-query.constants';
import { toTranslationSnapshot } from '../mappers/translation.mapper';
import type { AppLocale } from '../types/locale.types';
import type { TranslationSnapshot } from '../types/translation.types';

export async function getOwnedTranslation(
  ownerId: string,
  portfolioId: string,
  locale: AppLocale,
): Promise<TranslationSnapshot | null> {
  const row = await getDatabase().portfolioTranslation.findFirst({
    where: { ownerId, portfolioId, locale, portfolio: { deletedAt: null } },
    select: TRANSLATION_SELECT,
  });
  return row === null ? null : toTranslationSnapshot(row);
}

export async function listOwnedTranslations(
  ownerId: string,
  portfolioId: string,
): Promise<readonly TranslationSnapshot[]> {
  const rows = await getDatabase().portfolioTranslation.findMany({
    where: { ownerId, portfolioId, portfolio: { deletedAt: null } },
    orderBy: { locale: 'asc' },
    select: TRANSLATION_SELECT,
  });
  return rows.flatMap((row) => {
    const snapshot = toTranslationSnapshot(row);
    return snapshot === null ? [] : [snapshot];
  });
}

export async function saveOwnedTranslationDraft(
  ownerId: string,
  portfolioId: string,
  locale: AppLocale,
  document: PortfolioDocument,
  sourceFingerprint: string,
): Promise<TranslationSnapshot | null> {
  const portfolio = await getDatabase().portfolio.findFirst({
    where: { id: portfolioId, ownerId, deletedAt: null },
    select: { id: true },
  });
  if (portfolio === null) return null;

  const row = await getDatabase().portfolioTranslation.upsert({
    where: { portfolioId_locale: { portfolioId, locale } },
    create: { ownerId, portfolioId, locale, draftDocument: document, sourceFingerprint },
    update: {
      draftDocument: document,
      sourceFingerprint,
      draftVersion: { increment: 1 },
      reviewedDocument: DbNull,
      reviewedAt: null,
    },
    select: TRANSLATION_SELECT,
  });
  return toTranslationSnapshot(row);
}

export async function correctOwnedTranslationDraft(
  ownerId: string,
  portfolioId: string,
  locale: AppLocale,
  expectedVersion: number,
  document: PortfolioDocument,
): Promise<TranslationSnapshot | null> {
  const updated = await getDatabase().portfolioTranslation.updateMany({
    where: { ownerId, portfolioId, locale, draftVersion: expectedVersion },
    data: {
      draftDocument: document,
      draftVersion: { increment: 1 },
      reviewedDocument: DbNull,
      reviewedAt: null,
    },
  });
  return updated.count === 0 ? null : getOwnedTranslation(ownerId, portfolioId, locale);
}

export async function reviewOwnedTranslation(
  ownerId: string,
  portfolioId: string,
  locale: AppLocale,
  expectedVersion: number,
  reviewedAt: Date,
): Promise<TranslationSnapshot | null> {
  const current = await getOwnedTranslation(ownerId, portfolioId, locale);
  if (current?.draftVersion !== expectedVersion) return null;
  const updated = await getDatabase().portfolioTranslation.updateMany({
    where: { ownerId, portfolioId, locale, draftVersion: expectedVersion },
    data: { reviewedDocument: current.draftDocument, reviewedAt },
  });
  return updated.count === 0 ? null : getOwnedTranslation(ownerId, portfolioId, locale);
}

export async function publishOwnedTranslation(
  ownerId: string,
  portfolioId: string,
  locale: AppLocale,
  document: PortfolioDocument,
  publishedAt: Date,
): Promise<TranslationSnapshot | null> {
  const updated = await getDatabase().portfolioTranslation.updateMany({
    where: { ownerId, portfolioId, locale },
    data: {
      publishedDocument: document,
      publishedVersion: { increment: 1 },
      publishedAt,
    },
  });
  return updated.count === 0 ? null : getOwnedTranslation(ownerId, portfolioId, locale);
}
