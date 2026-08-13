import { describe, expect, it } from 'vitest';

import {
  buildAdminPortfolioListHref,
  buildAdminPortfolioRowViewData,
  buildAdminPortfolioStatusOptions,
  buildAdminUserDetailHref,
  formatAdminPortfolioDate,
  isAdminPortfolioStatusFilter,
  parseAdminPortfolioStatusFilter,
  sanitizeAdminPortfolioQuery,
} from '../helpers/admin-portfolio-view.helper';
import type { AdminPortfolioSummary } from '../types/admin-portfolio.types';

const translate = (key: string, values?: Readonly<Record<string, string | number>>): string =>
  values === undefined ? key : `${key}:${JSON.stringify(values)}`;

describe('isAdminPortfolioStatusFilter', () => {
  it('accepts every known filter value', () => {
    expect(isAdminPortfolioStatusFilter('ALL')).toBe(true);
    expect(isAdminPortfolioStatusFilter('SUSPENDED')).toBe(true);
  });

  it('rejects an unknown value', () => {
    expect(isAdminPortfolioStatusFilter('ARCHIVED')).toBe(false);
  });
});

describe('parseAdminPortfolioStatusFilter', () => {
  it('defaults to ALL when the value is missing', () => {
    expect(parseAdminPortfolioStatusFilter(undefined)).toBe('ALL');
  });

  it('defaults to ALL for an unknown value', () => {
    expect(parseAdminPortfolioStatusFilter('nope')).toBe('ALL');
  });

  it('accepts a known filter', () => {
    expect(parseAdminPortfolioStatusFilter('SUSPENDED')).toBe('SUSPENDED');
  });
});

describe('sanitizeAdminPortfolioQuery', () => {
  it('is empty when the value is missing', () => {
    expect(sanitizeAdminPortfolioQuery(undefined)).toBe('');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeAdminPortfolioQuery('  amina  ')).toBe('amina');
  });

  it('bounds an excessively long value', () => {
    expect(sanitizeAdminPortfolioQuery('a'.repeat(500))).toHaveLength(200);
  });
});

describe('buildAdminUserDetailHref', () => {
  it('builds the admin user detail path', () => {
    expect(buildAdminUserDetailHref('user-1')).toBe('/managawy/users/user-1');
  });
});

describe('formatAdminPortfolioDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(formatAdminPortfolioDate(new Date('2026-01-05T12:00:00.000Z'))).toBe('2026-01-05');
  });
});

describe('buildAdminPortfolioListHref', () => {
  it('is the bare path when every parameter is at its default', () => {
    expect(buildAdminPortfolioListHref('', 'ALL', 1)).toBe('/managawy/portfolios');
  });

  it('carries a trimmed search term', () => {
    expect(buildAdminPortfolioListHref('  amina  ', 'ALL', 1)).toBe('/managawy/portfolios?q=amina');
  });

  it('carries a non-default status', () => {
    expect(buildAdminPortfolioListHref('', 'SUSPENDED', 1)).toBe(
      '/managawy/portfolios?status=SUSPENDED',
    );
  });

  it('carries a page beyond the first', () => {
    expect(buildAdminPortfolioListHref('', 'ALL', 3)).toBe('/managawy/portfolios?page=3');
  });

  it('combines every non-default parameter', () => {
    expect(buildAdminPortfolioListHref('amina', 'DRAFT', 2)).toBe(
      '/managawy/portfolios?q=amina&status=DRAFT&page=2',
    );
  });
});

describe('buildAdminPortfolioStatusOptions', () => {
  it('translates every known filter in order', () => {
    expect(buildAdminPortfolioStatusOptions(translate)).toEqual([
      { value: 'ALL', label: 'portfolios.filters.all' },
      { value: 'PUBLISHED', label: 'portfolios.status.published' },
      { value: 'DRAFT', label: 'portfolios.status.draft' },
      { value: 'UNPUBLISHED', label: 'portfolios.status.unpublished' },
      { value: 'SUSPENDED', label: 'portfolios.status.suspended' },
    ]);
  });
});

describe('buildAdminPortfolioRowViewData', () => {
  const summary: AdminPortfolioSummary = {
    id: 'portfolio-1',
    slug: 'amina',
    ownerId: 'user-1',
    ownerEmail: 'amina@example.com',
    status: 'PUBLISHED',
    isSuspended: false,
    updatedAt: new Date('2026-02-01T00:00:00.000Z'),
  };

  it('builds an active row', () => {
    expect(buildAdminPortfolioRowViewData(summary, translate)).toEqual({
      id: 'portfolio-1',
      slug: 'amina',
      portfolioHref: '/portfolios/amina',
      ownerId: 'user-1',
      ownerEmail: 'amina@example.com',
      ownerHref: '/managawy/users/user-1',
      statusLabel: 'portfolios.status.published',
      statusTone: 'success',
      isSuspended: false,
      suspendedLabel: 'portfolios.suspended.no',
      suspendedTone: 'neutral',
      updatedAtLabel: '2026-02-01',
    });
  });

  it('builds a suspended row', () => {
    const view = buildAdminPortfolioRowViewData({ ...summary, isSuspended: true }, translate);

    expect(view.isSuspended).toBe(true);
    expect(view.suspendedLabel).toBe('portfolios.suspended.yes');
    expect(view.suspendedTone).toBe('danger');
  });
});
