import { describe, expect, it } from 'vitest';

import { toAdminPortfolioSummary } from '../mappers/admin-portfolio.mapper';
import type { AdminPortfolioRow } from '../types/admin-portfolio.types';

describe('toAdminPortfolioSummary', () => {
  const row: AdminPortfolioRow = {
    id: 'portfolio-1',
    slug: 'amina',
    status: 'PUBLISHED',
    ownerId: 'user-1',
    ownerEmail: 'amina@example.com',
    suspendedAt: null,
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
  };

  it('marks a row with no suspension timestamp as not suspended', () => {
    expect(toAdminPortfolioSummary(row)).toEqual({
      id: 'portfolio-1',
      slug: 'amina',
      ownerId: 'user-1',
      ownerEmail: 'amina@example.com',
      status: 'PUBLISHED',
      isSuspended: false,
      updatedAt: row.updatedAt,
    });
  });

  it('marks a row with a suspension timestamp as suspended', () => {
    const suspended = toAdminPortfolioSummary({
      ...row,
      suspendedAt: new Date('2026-02-02T00:00:00.000Z'),
    });

    expect(suspended.isSuspended).toBe(true);
  });
});
