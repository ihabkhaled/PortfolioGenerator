import { describe, expect, it } from 'vitest';

import { buildAdminDashboardStats } from '../helpers/admin-stats.helper';

describe('buildAdminDashboardStats', () => {
  it('shapes raw counts into display-ready stat tiles', () => {
    const stats = buildAdminDashboardStats({
      totalUsers: 42,
      totalPortfolios: 30,
      publishedPortfolios: 18,
      draftPortfolios: 10,
      unpublishedPortfolios: 2,
      signupsLast30Days: 7,
    });

    expect(stats).toEqual([
      { id: 'total-users', label: 'Total users', value: '42' },
      { id: 'total-portfolios', label: 'Total portfolios', value: '30' },
      { id: 'published-portfolios', label: 'Published', value: '18' },
      { id: 'draft-portfolios', label: 'Draft', value: '10' },
      { id: 'unpublished-portfolios', label: 'Unpublished', value: '2' },
      { id: 'signups-30d', label: 'Signups (30 days)', value: '7' },
    ]);
  });
});
