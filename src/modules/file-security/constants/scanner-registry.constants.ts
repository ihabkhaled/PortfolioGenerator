import type { ScannerHolder } from '../types/scanner.types';

/**
 * The configured scanner, memoized for the process.
 *
 * A holder object rather than a mutable export: the test seam that swaps the
 * scanner is then an ordinary function call, and no consumer can reassign the
 * binding out from under the service.
 */
export const SCANNER_REGISTRY: ScannerHolder = { current: null };
