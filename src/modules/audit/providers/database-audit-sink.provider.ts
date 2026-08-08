import 'server-only';

import { getDatabase } from '@/packages/database';
import { logger } from '@/packages/logger';

import type { AuditSink } from '../types/audit.types';

/**
 * Append-only audit rows in Postgres.
 *
 * Recording never fails the operation it describes. A publish that succeeded
 * and then lost its audit row is a gap in the trail; a publish that was rolled
 * back because the audit insert failed is a user staring at an error for a
 * thing that worked. The first is recoverable from application logs, the second
 * is not recoverable at all.
 */
export function createDatabaseAuditSink(): AuditSink {
  return {
    async record(event) {
      try {
        await getDatabase().auditEvent.create({
          data: {
            eventType: event.eventType,
            ownerId: event.ownerId,
            portfolioId: event.portfolioId,
            metadata: event.metadata ?? {},
          },
        });
      } catch {
        logger.error('audit.write_failed', { eventType: event.eventType });
      }
    },
  };
}
