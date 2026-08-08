import 'server-only';

import { logger } from '@/packages/logger';

import { AUDIT_SINK_REGISTRY } from '../constants/audit-registry.constants';
import { createDatabaseAuditSink } from '../providers/database-audit-sink.provider';
import type { AuditEventInput, AuditSink } from '../types/audit.types';

/**
 * The one way an audit event is recorded.
 *
 * Writes to the durable sink *and* the structured log. They answer different
 * questions: the table answers "what happened to this portfolio" during a
 * support conversation, the log answers "what is happening right now" during an
 * incident, and neither substitutes for the other.
 */

export function getAuditSink(): AuditSink {
  AUDIT_SINK_REGISTRY.value ??= createDatabaseAuditSink();

  return AUDIT_SINK_REGISTRY.value;
}

export function setAuditSink(sink: AuditSink | null): void {
  AUDIT_SINK_REGISTRY.value = sink;
}

export async function recordAuditEvent(event: AuditEventInput): Promise<void> {
  logger.info(event.eventType, {
    ownerId: event.ownerId,
    portfolioId: event.portfolioId,
    ...event.metadata,
  });

  await getAuditSink().record(event);
}
