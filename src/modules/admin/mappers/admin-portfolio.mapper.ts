import type {
  AdminPortfolioRow,
  AdminPortfolioStatus,
  AdminPortfolioSummary,
} from '../types/admin-portfolio.types';

/**
 * Database row to domain object, mirroring `toOwnedPortfolio` in
 * `src/modules/portfolios/mappers/portfolio.mapper.ts`: the row's `status`
 * column is untyped SQL text at the query boundary and is cast to the narrow
 * union here, the one place that trust is granted.
 */
export function toAdminPortfolioSummary(row: AdminPortfolioRow): AdminPortfolioSummary {
  return {
    id: row.id,
    slug: row.slug,
    ownerId: row.ownerId,
    ownerEmail: row.ownerEmail,
    status: row.status as AdminPortfolioStatus,
    isSuspended: row.suspendedAt !== null,
    updatedAt: row.updatedAt,
  };
}
