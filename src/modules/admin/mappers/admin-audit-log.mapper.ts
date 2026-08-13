import type { AdminAuditEventRow, AdminAuditEventSummary } from '../types/admin-audit-log.types';
import type { AdminAuditTargetType } from '../types/admin.types';

/**
 * Database row to domain object, mirroring `toAdminPortfolioSummary`: the
 * row's `targetType` column is untyped SQL text at the query boundary and is
 * cast to the narrow union here, the one place that trust is granted.
 */
export function toAdminAuditEventSummary(row: AdminAuditEventRow): AdminAuditEventSummary {
  return {
    id: row.id,
    adminUserId: row.adminUserId,
    adminName: row.adminName,
    adminEmail: row.adminEmail,
    targetType: row.targetType as AdminAuditTargetType,
    targetId: row.targetId,
    action: row.action,
    metadata: row.metadata,
    createdAt: row.createdAt,
  };
}
