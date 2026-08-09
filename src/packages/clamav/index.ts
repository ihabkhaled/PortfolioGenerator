import 'server-only';

/**
 * Owner of the clamd protocol.
 *
 * Spoken directly over TCP rather than through a client library: the protocol
 * is three commands and a length-prefixed stream, and a dependency here would
 * be more code to audit than the code it replaces — for something that reads
 * every byte of an untrusted upload.
 */

export {
  CLAMAV_CHUNK_BYTES,
  CLAMAV_CLEAN_SUFFIX,
  CLAMAV_COMMAND_INSTREAM,
  CLAMAV_COMMAND_PING,
  CLAMAV_FOUND_SUFFIX,
  CLAMAV_PONG_RESPONSE,
  CLAMAV_SIZE_LIMIT_MARKER,
  CLAMAV_STREAM_TERMINATOR,
} from './clamav.constants';
export { interpretClamAvResponse } from './clamav-response';
export { getClamAvVersion, pingClamAv, scanBufferWithClamAv } from './clamav-client';
export { parseClamAvSignatureDate, signatureDatabaseIsFresh } from './clamav-version';
export type { ClamAvConnection, ClamAvVerdict } from './clamav.types';
