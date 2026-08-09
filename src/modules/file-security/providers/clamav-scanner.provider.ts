import 'server-only';

import { scanBufferWithClamAv } from '@/packages/clamav';
import type { ClamAvConnection } from '@/packages/clamav';

import type { FileScanner, ScanResult } from '../types/scanner.types';

/**
 * The real scanner.
 *
 * Every clamd failure — refused, timed out, unparseable — becomes
 * `unavailable` rather than `clean`. The distinction is the whole point: the
 * service above decides whether an unscanned upload is acceptable, and it can
 * only decide that if this layer refuses to pretend.
 */
export function createClamAvScanner(connection: ClamAvConnection): FileScanner {
  return {
    async scan(bytes: Uint8Array): Promise<ScanResult> {
      const verdict = await scanBufferWithClamAv(bytes, connection);

      if (verdict.status === 'clean') {
        return { outcome: 'clean', signature: null, detail: null };
      }

      if (verdict.status === 'infected') {
        return { outcome: 'infected', signature: verdict.signature, detail: null };
      }

      return { outcome: 'unavailable', signature: null, detail: verdict.reason };
    },
  };
}
