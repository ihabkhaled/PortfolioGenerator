/**
 * clamd's wire protocol, as constants rather than magic strings.
 *
 * The daemon speaks a tiny line protocol over TCP. `zINSTREAM` streams the
 * bytes to be scanned in length-prefixed chunks and is the only command this
 * product needs: it never writes the file where clamd could read it, so a
 * shared filesystem between the app and the scanner is not required.
 */
export const CLAMAV_COMMAND_INSTREAM = 'zINSTREAM\0';
export const CLAMAV_COMMAND_PING = 'zPING\0';
export const CLAMAV_COMMAND_VERSION = 'zVERSION\0';

/** clamd's own chunk ceiling. Larger frames are rejected by the daemon. */
export const CLAMAV_CHUNK_BYTES = 65_536;

/** A zero-length chunk header is how a stream says it is finished. */
export const CLAMAV_STREAM_TERMINATOR = Buffer.from([0, 0, 0, 0]);

export const CLAMAV_PONG_RESPONSE = 'PONG';
export const CLAMAV_CLEAN_SUFFIX = 'OK';
export const CLAMAV_FOUND_SUFFIX = 'FOUND';
export const CLAMAV_SIZE_LIMIT_MARKER = 'INSTREAM size limit exceeded';
