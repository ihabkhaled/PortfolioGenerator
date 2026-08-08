import { describe, expect, it } from 'vitest';

import type { PortfolioSummary } from '@/modules/portfolios';
import { buildPortfolioListItems, formatIsoDate } from '@/modules/portfolios/dashboard';

function summary(overrides: Partial<PortfolioSummary> = {}): PortfolioSummary {
  return {
    id: 'portfolio-1',
    slug: 'amina-rahman',
    status: 'PUBLISHED',
    displayName: 'Amina Rahman',
    headline: 'Backend engineer',
    updatedAt: new Date('2026-01-15T10:00:00.000Z'),
    publishedAt: new Date('2026-01-15T10:00:00.000Z'),
    ...overrides,
  };
}

const translate = (key: string, values?: Record<string, string | number>): string =>
  values === undefined ? key : `${key}:${JSON.stringify(values)}`;

describe('buildPortfolioListItems', () => {
  it('maps a published portfolio', () => {
    const [item] = buildPortfolioListItems([summary()], translate);

    expect(item).toMatchObject({
      title: 'Amina Rahman',
      statusLabel: 'status.published',
      statusTone: 'success',
      isPublished: true,
    });
  });

  it('falls back to the slug so an unnamed draft is still clickable', () => {
    const [item] = buildPortfolioListItems([summary({ displayName: ' '.repeat(3) })], translate);

    expect(item?.title).toBe('amina-rahman');
  });

  it('says so when a portfolio has never been published', () => {
    const [item] = buildPortfolioListItems(
      [summary({ status: 'DRAFT', publishedAt: null })],
      translate,
    );

    expect(item?.meta).toBe('meta.neverPublished');
    expect(item?.statusTone).toBe('neutral');
    expect(item?.isPublished).toBe(false);
  });

  it('marks an unpublished portfolio as needing attention', () => {
    const [item] = buildPortfolioListItems([summary({ status: 'UNPUBLISHED' })], translate);

    expect(item?.statusTone).toBe('warning');
    expect(item?.isPublished).toBe(false);
  });
});

describe('formatIsoDate', () => {
  it('renders a stable date, so server and client cannot disagree during hydration', () => {
    expect(formatIsoDate(new Date('2026-01-15T23:59:59.000Z'))).toBe('2026-01-15');
  });
});
