import type { PortfolioRow } from '@/modules/portfolios';

import { buildFullPortfolioDocument } from './portfolio-document.fixtures';

/**
 * A database row shaped exactly as the repository selects it.
 *
 * Built from a plain object rather than a Prisma mock so mapper tests exercise
 * the real parsing path, including the case that matters most: a row whose JSON
 * columns hold something the current schema rejects.
 */
export function buildPortfolioRow(overrides: Partial<PortfolioRow> = {}): PortfolioRow {
  const document = buildFullPortfolioDocument();

  return {
    id: 'portfolio-1',
    ownerId: 'owner-1',
    slug: 'amina-rahman',
    status: 'PUBLISHED',
    templateId: document.theme.templateId,
    draftDocument: document,
    draftVersion: 3,
    publishedDocument: document,
    publishedVersion: 1,
    publishedAt: new Date('2026-01-15T10:00:00.000Z'),
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    updatedAt: new Date('2026-01-15T10:00:00.000Z'),
    ...overrides,
  };
}
