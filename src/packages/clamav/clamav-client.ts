import 'server-only';

import { connect } from 'node:net';

import { interpretClamAvResponse } from './clamav-response';
import {
  CLAMAV_CHUNK_BYTES,
  CLAMAV_COMMAND_INSTREAM,
  CLAMAV_COMMAND_PING,
  CLAMAV_COMMAND_VERSION,
  CLAMAV_PONG_RESPONSE,
  CLAMAV_STREAM_TERMINATOR,
} from './clamav.constants';
import type { ClamAvConnection, ClamAvVerdict } from './clamav.types';

/**
 * Stream a buffer to clamd and wait for its verdict.
 *
 * Every failure path — refused connection, timeout, socket error, unparseable
 * answer — resolves to `unavailable` rather than throwing. The caller has a
 * policy decision to make about unscanned uploads, and it cannot make it from
 * inside a catch block three layers up.
 *
 * The timeout is not optional. A scanner that hangs holds a request open for as
 * long as the platform's own timeout allows, which turns one sick container
 * into every upload failing slowly instead of quickly.
 */
export async function scanBufferWithClamAv(
  bytes: Uint8Array,
  connection: ClamAvConnection,
): Promise<ClamAvVerdict> {
  return new Promise<ClamAvVerdict>((resolve) => {
    const socket = connect({ host: connection.host, port: connection.port });
    const chunks: Buffer[] = [];
    let settled = false;

    function settle(verdict: ClamAvVerdict): void {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(verdict);
    }

    socket.setTimeout(connection.timeoutMs);
    socket.on('timeout', () => {
      settle({ status: 'unavailable', reason: 'timeout' });
    });
    socket.on('error', (error: Error) => {
      settle({ status: 'unavailable', reason: error.message });
    });
    socket.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    socket.on('close', () => {
      settle(interpretClamAvResponse(Buffer.concat(chunks).toString('utf8')));
    });

    socket.on('connect', () => {
      socket.write(CLAMAV_COMMAND_INSTREAM);

      for (let offset = 0; offset < bytes.length; offset += CLAMAV_CHUNK_BYTES) {
        const slice = bytes.subarray(offset, offset + CLAMAV_CHUNK_BYTES);
        const header = Buffer.alloc(4);

        header.writeUInt32BE(slice.length, 0);
        socket.write(header);
        socket.write(slice);
      }

      socket.write(CLAMAV_STREAM_TERMINATOR);
    });
  });
}

/** Liveness, for the health probe. Never throws, for the same reason. */
export async function pingClamAv(connection: ClamAvConnection): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const socket = connect({ host: connection.host, port: connection.port });
    let settled = false;

    function settle(alive: boolean): void {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(alive);
    }

    socket.setTimeout(connection.timeoutMs);
    socket.on('timeout', () => {
      settle(false);
    });
    socket.on('error', () => {
      settle(false);
    });
    socket.on('data', (chunk: Buffer) => {
      settle(chunk.toString('utf8').includes(CLAMAV_PONG_RESPONSE));
    });
    socket.on('connect', () => {
      socket.write(CLAMAV_COMMAND_PING);
    });
  });
}

export async function getClamAvVersion(connection: ClamAvConnection): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const socket = connect({ host: connection.host, port: connection.port });
    let settled = false;
    function settle(value: string | null): void {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    }
    socket.setTimeout(connection.timeoutMs);
    socket.on('timeout', () => {
      settle(null);
    });
    socket.on('error', () => {
      settle(null);
    });
    socket.on('data', (chunk: Buffer) => {
      settle(chunk.toString('utf8'));
    });
    socket.on('connect', () => {
      socket.write(CLAMAV_COMMAND_VERSION);
    });
  });
}
