import 'server-only';

import { getDatabase } from '@/packages/database';
import type { Prisma } from '@/packages/database';

import type {
  AdminPortfolioListResult,
  AdminPortfolioSearchParams,
  AdminPortfolioStatusFilter,
} from '../types/admin-portfolio.types';

/**
 * Every portfolio, across every owner — the moderation list's cross-tenant
 * read. It lives here rather than as an `Unscoped` accessor reached into the
 * portfolios module: that module's own repository is deliberately owner-scoped
 * with no `findAll`, and the sanctioned pattern for a genuinely tenant-free
 * admin read is a plain query in the admin module itself, exactly like
 * `getAdminDashboardStats` in `admin-stats.repository.ts`.
 *
 * `count` and `findMany` share one `where` so the total a pagination control
 * shows and the rows it paginates can never disagree about which portfolios
 * matched.
 */
export async function listAdminPortfolios(
  params: AdminPortfolioSearchParams,
): Promise<AdminPortfolioListResult> {
  const database = getDatabase();
  const where = buildAdminPortfolioWhere(params);

  const [rows, totalCount] = await Promise.all([
    database.portfolio.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      skip: params.offset,
      take: params.limit,
      select: {
        id: true,
        slug: true,
        status: true,
        ownerId: true,
        suspendedAt: true,
        updatedAt: true,
        owner: { select: { email: true } },
      },
    }),
    database.portfolio.count({ where }),
  ]);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      status: row.status,
      ownerId: row.ownerId,
      ownerEmail: row.owner.email,
      suspendedAt: row.suspendedAt,
      updatedAt: row.updatedAt,
    })),
    totalCount,
  };
}

/**
 * The owner id behind one portfolio, for the admin delete action to resolve
 * before it does anything — never trusted from the request, only looked up.
 *
 * Narrow and admin-only, mirroring `setPortfolioSuspension` in the portfolios
 * module's own repository: not owner-scoped, because the caller is a
 * moderator rather than the portfolio's owner, and it hands back nothing but
 * the one id the caller needs.
 */
export async function getAdminPortfolioOwnerId(portfolioId: string): Promise<string | null> {
  const row = await getDatabase().portfolio.findUnique({
    where: { id: portfolioId },
    select: { ownerId: true },
  });

  return row?.ownerId ?? null;
}

function buildAdminPortfolioWhere(params: AdminPortfolioSearchParams): Prisma.PortfolioWhereInput {
  const trimmedQuery = params.query.trim();
  const statusFilter = buildStatusFilter(params.status);
  const searchFilter: Prisma.PortfolioWhereInput =
    trimmedQuery === ''
      ? {}
      : {
          OR: [
            { slug: { contains: trimmedQuery, mode: 'insensitive' } },
            { owner: { email: { contains: trimmedQuery, mode: 'insensitive' } } },
          ],
        };

  return { deletedAt: null, ...statusFilter, ...searchFilter };
}

function buildStatusFilter(status: AdminPortfolioStatusFilter): Prisma.PortfolioWhereInput {
  if (status === 'ALL') {
    return {};
  }

  if (status === 'SUSPENDED') {
    return { suspendedAt: { not: null } };
  }

  return { status };
}
