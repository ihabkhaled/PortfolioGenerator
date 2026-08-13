import 'server-only';

import { logger } from '@/packages/logger';

import { ADMIN_AUDIT_SINK_REGISTRY } from '../constants/admin-audit-registry.constants';
import { createDatabaseAdminAuditSink } from '../providers/database-admin-audit-sink.provider';
import type { AdminAuditEventInput, AdminAuditSink } from '../types/admin.types';

export function getAdminAuditSink(): AdminAuditSink {
  ADMIN_AUDIT_SINK_REGISTRY.value ??= createDatabaseAdminAuditSink();

  return ADMIN_AUDIT_SINK_REGISTRY.value;
}

export function setAdminAuditSink(sink: AdminAuditSink | null): void {
  ADMIN_AUDIT_SINK_REGISTRY.value = sink;
}

/**
 * The one way an admin audit event is recorded.
 *
 * Writes to the durable sink *and* the structured log, mirroring
 * `recordAuditEvent`: the table answers "what did this admin do" during a
 * support conversation, the log answers "what is happening right now" during
 * an incident.
 */
export async function recordAdminAuditEvent(event: AdminAuditEventInput): Promise<void> {
  logger.info(event.action, {
    adminUserId: event.adminUserId,
    targetType: event.targetType,
    targetId: event.targetId,
    ...event.metadata,
  });

  await getAdminAuditSink().record(event);
}
