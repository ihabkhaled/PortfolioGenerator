/** A single validation failure, flattened to a dotted path. */
export interface ParseIssue {
  /** Dotted path to the offending field, e.g. `experience.0.endDate`. */
  readonly path: string;
  readonly code: string;
  readonly message: string;
}

export interface ParseSuccess<TValue> {
  readonly ok: true;
  readonly value: TValue;
}

export interface ParseFailure {
  readonly ok: false;
  readonly issues: readonly ParseIssue[];
}

export type ParseResult<TValue> = ParseSuccess<TValue> | ParseFailure;
