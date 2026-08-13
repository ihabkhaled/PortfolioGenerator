import type {
  AdminDashboardStatsCounts,
  AdminStatTile,
} from '../types/admin-dashboard-stats.types';

export function buildAdminDashboardStats(
  counts: AdminDashboardStatsCounts,
): readonly AdminStatTile[] {
  return [
    { id: 'total-users', label: 'Total users', value: String(counts.totalUsers) },
    { id: 'total-portfolios', label: 'Total portfolios', value: String(counts.totalPortfolios) },
    { id: 'published-portfolios', label: 'Published', value: String(counts.publishedPortfolios) },
    { id: 'draft-portfolios', label: 'Draft', value: String(counts.draftPortfolios) },
    {
      id: 'unpublished-portfolios',
      label: 'Unpublished',
      value: String(counts.unpublishedPortfolios),
    },
    { id: 'signups-30d', label: 'Signups (30 days)', value: String(counts.signupsLast30Days) },
  ];
}
