import {
  CLAMAV_CLEAN_SUFFIX,
  CLAMAV_FOUND_SUFFIX,
  CLAMAV_SIZE_LIMIT_MARKER,
} from './clamav.constants';
import type { ClamAvVerdict } from './clamav.types';

/**
 * Turn clamd's one-line answer into a verdict.
 *
 * The daemon answers `stream: OK` or `stream: Eicar-Test-Signature FOUND`. A
 * response this function does not recognise becomes `unavailable` rather than
 * `clean`: an unparsed answer is not evidence that a file is safe, and reading
 * it as one is exactly how a scanner stops scanning without anyone noticing.
 */
export function interpretClamAvResponse(response: string): ClamAvVerdict {
  const line = response.replaceAll('\0', '').trim();

  if (line.endsWith(CLAMAV_CLEAN_SUFFIX)) {
    return { status: 'clean' };
  }

  if (line.endsWith(CLAMAV_FOUND_SUFFIX)) {
    const signature = line.slice(line.indexOf(':') + 1, -CLAMAV_FOUND_SUFFIX.length).trim();

    return { status: 'infected', signature: signature === '' ? 'unknown' : signature };
  }

  if (line.includes(CLAMAV_SIZE_LIMIT_MARKER)) {
    return { status: 'unavailable', reason: 'size-limit' };
  }

  return { status: 'unavailable', reason: line === '' ? 'empty-response' : 'unrecognised' };
}
