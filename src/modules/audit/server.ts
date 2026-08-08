import 'server-only';

/** Server-only surface: the configured sink and the recording entry point. */

export { createDatabaseAuditSink } from './providers/database-audit-sink.provider';
export { getAuditSink, recordAuditEvent, setAuditSink } from './services/audit.service';
