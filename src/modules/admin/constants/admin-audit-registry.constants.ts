import type { AdminAuditSink } from '../types/admin.types';

/** The process-wide slot holding the configured admin audit sink. */
export const ADMIN_AUDIT_SINK_REGISTRY: { value: AdminAuditSink | null } = { value: null };
