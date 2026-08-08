import type { AuditSink } from '../types/audit.types';

/** The process-wide slot holding the configured audit sink. */
export const AUDIT_SINK_REGISTRY: { value: AuditSink | null } = { value: null };
