import 'server-only';

import { getServerEnv } from '@/packages/env/server';
import { logger } from '@/packages/logger';

import { FILE_REJECTIONS } from '../constants/file-security.constants';
import { SCANNER_REGISTRY } from '../constants/scanner-registry.constants';
import { inspectUpload, inspectUploadForPurpose } from '../policies/file-inspection.policy';
import { createClamAvScanner } from '../providers/clamav-scanner.provider';
import { createDisabledScanner } from '../providers/disabled-scanner.provider';
import { createRequiredScanner } from '../providers/required-scanner.provider';
import type {
  FileInspection,
  FileKind,
  PurposeUploadCandidate,
  UploadCandidate,
} from '../types/file-security.types';
import type { FileScanner, ScanResult } from '../types/scanner.types';

/**
 * The complete gate an uploaded file passes before it is stored.
 *
 * Shape first, then contents: an upload that is obviously wrong never costs a
 * network round trip to the scanner, and the scanner never sees a file whose
 * type the product does not accept.
 */

export function getFileScanner(): FileScanner {
  if (SCANNER_REGISTRY.current !== null) {
    return SCANNER_REGISTRY.current;
  }

  const env = getServerEnv();

  if (env.CLAMAV_ENABLED) {
    SCANNER_REGISTRY.current = createClamAvScanner({
      host: env.CLAMAV_HOST,
      port: env.CLAMAV_PORT,
      timeoutMs: env.CLAMAV_TIMEOUT_MS,
    });
  } else {
    SCANNER_REGISTRY.current =
      env.NODE_ENV === 'production' ? createRequiredScanner() : createDisabledScanner();
  }

  return SCANNER_REGISTRY.current;
}

/** Test seam. The suite injects a scanner rather than standing up a daemon. */
export function setFileScanner(scanner: FileScanner | null): void {
  SCANNER_REGISTRY.current = scanner;
}

export async function inspectAndScan(
  candidate: UploadCandidate,
  kind: FileKind,
  maxBytes: number,
): Promise<FileInspection> {
  const inspection = inspectUpload(candidate, kind, maxBytes);

  if (!inspection.ok) {
    logger.info('upload.rejected', { rejection: inspection.rejection, kind });

    return inspection;
  }

  const scan = await getFileScanner().scan(candidate.bytes);

  if (scan.outcome === 'infected') {
    logger.warn('upload.infected', { signature: scan.signature, kind });

    return { ok: false, rejection: FILE_REJECTIONS.infected, detail: scan.signature };
  }

  /*
   * An unreachable scanner refuses the upload.
   *
   * The alternative — storing it and scanning later — means the file exists in
   * the bucket, and possibly on a public page, before anyone has looked at it.
   * Refusing is visible, recoverable and honest: the user is told to try again,
   * and the operator sees the outage in the logs rather than in a bucket full
   * of unscanned files.
   */
  if (scan.outcome === 'unavailable') {
    logger.error('upload.scanner_unavailable', { detail: scan.detail, kind });

    return { ok: false, rejection: FILE_REJECTIONS.scannerUnavailable, detail: scan.detail };
  }

  return inspection;
}

/** Purpose-aware gate used by portraits, galleries and downloadable assets. */
export async function inspectAndScanForPurpose(
  candidate: PurposeUploadCandidate,
): Promise<FileInspection> {
  const inspection = inspectUploadForPurpose(candidate);

  if (!inspection.ok) {
    logger.info('upload.rejected', {
      rejection: inspection.rejection,
      purpose: candidate.purpose,
    });

    return inspection;
  }

  const scan = await getFileScanner().scan(candidate.bytes);

  if (scan.outcome === 'infected') {
    logger.warn('upload.infected', {
      signature: scan.signature,
      purpose: candidate.purpose,
    });

    return { ok: false, rejection: FILE_REJECTIONS.infected, detail: scan.signature };
  }

  if (scan.outcome === 'unavailable') {
    logger.error('upload.scanner_unavailable', {
      detail: scan.detail,
      purpose: candidate.purpose,
    });

    return { ok: false, rejection: FILE_REJECTIONS.scannerUnavailable, detail: scan.detail };
  }

  return inspection;
}

/** The scan on its own, for callers that have already inspected the shape. */
export async function scanBytes(bytes: Uint8Array): Promise<ScanResult> {
  return getFileScanner().scan(bytes);
}
