import 'server-only';

import { getDatabase } from '@/packages/database';

import type { AdminDashboardStatsCounts } from '../types/admin-dashboard-stats.types';

/**
 * Read-only aggregate counts across every owner — the one legitimate
 * cross-tenant read in this codebase, and deliberately never anything more
 * granular than a count: no individual user or portfolio row ever comes back
 * from here.
 */
export async function getAdminDashboardStats(): Promise<AdminDashboardStatsCounts> {
  const database = getDatabase();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalPortfolios,
    publishedPortfolios,
    draftPortfolios,
    unpublishedPortfolios,
    signupsLast30Days,
  ] = await Promise.all([
    database.user.count(),
    database.portfolio.count({ where: { deletedAt: null } }),
    database.portfolio.count({ where: { deletedAt: null, status: 'PUBLISHED' } }),
    database.portfolio.count({ where: { deletedAt: null, status: 'DRAFT' } }),
    database.portfolio.count({ where: { deletedAt: null, status: 'UNPUBLISHED' } }),
    database.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  return {
    totalUsers,
    totalPortfolios,
    publishedPortfolios,
    draftPortfolios,
    unpublishedPortfolios,
    signupsLast30Days,
  };
}
