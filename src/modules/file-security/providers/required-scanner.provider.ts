import type { FileScanner, ScanResult } from '../types/scanner.types';

/** Fails uploads closed when production has no scanner configured. */
export function createRequiredScanner(): FileScanner {
  return {
    scan(): Promise<ScanResult> {
      return Promise.resolve({
        outcome: 'unavailable',
        signature: null,
        detail: 'production-scanner-required',
      });
    },
  };
}
