/**
 * The events that change what the public can see, or what the platform spends.
 *
 * A closed set rather than free-form strings: these are the rows someone reads
 * during an incident, and "what event types exist" should be answerable from
 * the type system rather than a `SELECT DISTINCT`.
 */
export type AuditEventType =
  | 'portfolio.created'
  | 'portfolio.published'
  | 'portfolio.unpublished'
  | 'portfolio.slug_changed'
  | 'portfolio.deleted'
  | 'resume.uploaded'
  | 'resume.rejected'
  | 'resume.text_extracted'
  | 'resume.deleted'
  | 'ai.extraction.started'
  | 'ai.extraction.succeeded'
  | 'ai.extraction.failed'
  | 'account.deleted';

/**
 * Bounded metadata. Scalars only, and never CV text — an audit table that
 * accumulates document bodies is a second, unmanaged copy of everyone's
 * private data with none of the deletion guarantees the first one has.
 */
export type AuditMetadata = Readonly<Record<string, string | number | boolean | null>>;

export interface AuditEventInput {
  readonly eventType: AuditEventType;
  readonly ownerId: string | null;
  readonly portfolioId: string | null;
  readonly metadata?: AuditMetadata;
}

/** The sink an audit event is written to. */
export interface AuditSink {
  record: (event: AuditEventInput) => Promise<void>;
}
