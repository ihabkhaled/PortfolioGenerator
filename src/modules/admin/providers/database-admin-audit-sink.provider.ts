import 'server-only';

import { getDatabase } from '@/packages/database';
import { logger } from '@/packages/logger';

import type { AdminAuditSink } from '../types/admin.types';

/**
 * Append-only admin-action rows in Postgres, mirroring
 * `createDatabaseAuditSink` (`src/modules/audit`) exactly: recording never
 * fails the operation it describes.
 */
export function createDatabaseAdminAuditSink(): AdminAuditSink {
  return {
    async record(event) {
      try {
        await getDatabase().adminAuditEvent.create({
          data: {
            adminUserId: event.adminUserId,
            targetType: event.targetType,
            targetId: event.targetId,
            action: event.action,
            metadata: event.metadata ?? {},
          },
        });
      } catch {
        logger.error('admin_audit.write_failed', { action: event.action });
      }
    },
  };
}
