import type { SCAN_OUTCOMES } from '../constants/file-security.constants';

export type ScanOutcome = (typeof SCAN_OUTCOMES)[number];

export interface ScanResult {
  readonly outcome: ScanOutcome;
  /** The signature name when something was found; null otherwise. */
  readonly signature: string | null;
  readonly detail: string | null;
}

/**
 * The scanner contract.
 *
 * One method, taking bytes rather than a path: the pipeline never writes an
 * unscanned file anywhere a scanner could read it, so there is no shared volume
 * to arrange and no window in which the file exists on disk unchecked.
 */
export interface FileScanner {
  scan: (bytes: Uint8Array) => Promise<ScanResult>;
}

/**
 * The configured scanner, memoized.
 *
 * A holder rather than a module-level `let`, so the test seam that swaps it is
 * an ordinary function call rather than a mutable export.
 */
export interface ScannerHolder {
  current: FileScanner | null;
}
