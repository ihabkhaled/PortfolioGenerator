import 'server-only';

import { getDatabase } from '@/packages/database';
import type { Prisma } from '@/packages/database';

import type {
  AdminAuditLogFilterOptions,
  AdminAuditLogListResult,
  AdminAuditLogSearchParams,
} from '../types/admin-audit-log.types';

/**
 * Every admin-audit event, across every acting admin — the audit log's
 * cross-tenant read. It lives here rather than as an `Unscoped` accessor
 * reached into another module: an admin's own actions are this module's own
 * data, exactly like `getAdminDashboardStats` and `listAdminPortfolios`.
 *
 * `count` and `findMany` share one `where` so the total a pagination control
 * shows and the rows it paginates can never disagree about which events
 * matched. Joined to `AdminUser` so a row carries the acting admin's name and
 * email, never just an id an operator would have to look up separately.
 */
export async function listAdminAuditEvents(
  params: AdminAuditLogSearchParams,
): Promise<AdminAuditLogListResult> {
  const database = getDatabase();
  const where = buildAdminAuditLogWhere(params);

  const [rows, totalCount] = await Promise.all([
    database.adminAuditEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: params.offset,
      take: params.limit,
      select: {
        id: true,
        adminUserId: true,
        targetType: true,
        targetId: true,
        action: true,
        metadata: true,
        createdAt: true,
        adminUser: { select: { name: true, email: true } },
      },
    }),
    database.adminAuditEvent.count({ where }),
  ]);

  return {
    rows: rows.map((row) => ({
      id: row.id,
      adminUserId: row.adminUserId,
      adminName: row.adminUser.name,
      adminEmail: row.adminUser.email,
      targetType: row.targetType,
      targetId: row.targetId,
      action: row.action,
      metadata: row.metadata,
      createdAt: row.createdAt,
    })),
    totalCount,
  };
}

/**
 * What the filters form can offer: every admin who has recorded at least one
 * event, and every action code that has ever been recorded — grounded in
 * real data rather than the full admin roster (owned by the admins-management
 * screen, not this one) or a hardcoded list that could drift.
 */
export async function getAdminAuditLogFilterOptions(): Promise<AdminAuditLogFilterOptions> {
  const database = getDatabase();

  const [adminRows, actionRows] = await Promise.all([
    database.adminAuditEvent.findMany({
      distinct: ['adminUserId'],
      orderBy: { adminUserId: 'asc' },
      select: { adminUserId: true, adminUser: { select: { name: true, email: true } } },
    }),
    database.adminAuditEvent.findMany({
      distinct: ['action'],
      orderBy: { action: 'asc' },
      select: { action: true },
    }),
  ]);

  return {
    admins: adminRows
      .map((row) => ({ id: row.adminUserId, name: row.adminUser.name, email: row.adminUser.email }))
      .toSorted((a, b) => a.name.localeCompare(b.name)),
    actions: actionRows.map((row) => row.action),
  };
}

function buildAdminAuditLogWhere(
  params: AdminAuditLogSearchParams,
): Prisma.AdminAuditEventWhereInput {
  const trimmedQuery = params.query.trim();
  const targetTypeFilter: Prisma.AdminAuditEventWhereInput =
    params.targetType === 'ALL' ? {} : { targetType: params.targetType };
  const adminFilter: Prisma.AdminAuditEventWhereInput =
    params.adminUserId === undefined ? {} : { adminUserId: params.adminUserId };
  const actionFilter: Prisma.AdminAuditEventWhereInput =
    params.action === undefined ? {} : { action: params.action };
  const searchFilter: Prisma.AdminAuditEventWhereInput =
    trimmedQuery === '' ? {} : { targetId: { contains: trimmedQuery, mode: 'insensitive' } };

  return { ...targetTypeFilter, ...adminFilter, ...actionFilter, ...searchFilter };
}
