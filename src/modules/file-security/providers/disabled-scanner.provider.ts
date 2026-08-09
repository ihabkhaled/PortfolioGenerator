import type { FileScanner, ScanResult } from '../types/scanner.types';

/**
 * The scanner used when scanning is switched off.
 *
 * It reports `skipped`, never `clean`. A development environment with no
 * clamd should not produce upload records that claim a scan happened — the
 * audit trail is read during incidents, and a false "clean" there is worse than
 * no record at all.
 */
export function createDisabledScanner(): FileScanner {
  return {
    scan(): Promise<ScanResult> {
      return Promise.resolve({ outcome: 'skipped', signature: null, detail: 'scanner-disabled' });
    },
  };
}
