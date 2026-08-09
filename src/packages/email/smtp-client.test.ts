import type * as NodeNet from 'node:net';
import { Duplex } from 'node:stream';
import type * as NodeTls from 'node:tls';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSmtpEmailSender } from './smtp-client';

const network = vi.hoisted(() => ({ connect: vi.fn() }));
const tls = vi.hoisted(() => ({ connect: vi.fn() }));

vi.mock('node:net', async (importOriginal) => {
  const actual = await importOriginal<typeof NodeNet>();
  return {
    ...actual,
    default: { ...actual, connect: network.connect },
    connect: network.connect,
  };
});

vi.mock('node:tls', async (importOriginal) => {
  const actual = await importOriginal<typeof NodeTls>();
  return {
    ...actual,
    default: { ...actual, connect: tls.connect },
    connect: tls.connect,
  };
});

type StallStage = 'CONNECT' | 'AUTH' | 'MAIL' | 'RCPT' | 'DATA' | 'BODY' | 'QUIT';

class ScriptedSmtpSocket extends Duplex {
  private readonly responseTimers = new Set<ReturnType<typeof setTimeout>>();
  readonly commands: string[] = [];
  readonly unhandledErrors: Error[] = [];
  destructionCount = 0;
  errorListenersBeforeDestroy = 0;

  constructor(
    private readonly stallAt: StallStage | null,
    private readonly responseDelayMs = 0,
    private readonly errorAfterStage: StallStage | null = null,
  ) {
    super();
  }

  private stageFor(command: string): StallStage | null {
    if (command === 'AUTH LOGIN') return 'AUTH';
    if (command.startsWith('MAIL FROM:')) return 'MAIL';
    if (command.startsWith('RCPT TO:')) return 'RCPT';
    if (command === 'DATA') return 'DATA';
    if (command.includes('\r\nSubject:')) return 'BODY';
    if (command === 'QUIT') return 'QUIT';
    return null;
  }

  private statusFor(command: string): string {
    if (command.startsWith('EHLO ')) return '250 smtp.test';
    if (command === 'AUTH LOGIN' || command === Buffer.from('smtp-user').toString('base64')) {
      return '334 continue';
    }
    if (command === Buffer.from('smtp-password').toString('base64')) return '235 authenticated';
    if (command.startsWith('MAIL FROM:') || command.startsWith('RCPT TO:')) return '250 ok';
    if (command === 'DATA') return '354 continue';
    if (command === 'STARTTLS') return '220 ready';
    if (command === 'QUIT') return '221 bye';
    return '250 accepted';
  }

  override _read(): void {}

  override _write(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    const command = chunk.toString('utf8').replace(/\r\n$/u, '');
    this.commands.push(command);
    const stage = this.stageFor(command);
    if (stage !== null && stage === this.stallAt) {
      callback();
      return;
    }

    const respond = (): void => {
      if (this.destroyed) return;
      this.emit('data', Buffer.from(`${this.statusFor(command)}\r\n`));
      if (stage !== null && stage === this.errorAfterStage) {
        try {
          this.emit('error', new Error('SMTP socket failed after response'));
        } catch (error) {
          this.unhandledErrors.push(error as Error);
        }
      }
    };
    if (this.responseDelayMs === 0) respond();
    else {
      const timer = setTimeout(() => {
        this.responseTimers.delete(timer);
        respond();
      }, this.responseDelayMs);
      timer.unref();
      this.responseTimers.add(timer);
    }
    callback();
  }

  override _destroy(error: Error | null, callback: (error?: Error | null) => void): void {
    this.errorListenersBeforeDestroy = this.listenerCount('error');
    this.destructionCount += 1;
    for (const timer of this.responseTimers) clearTimeout(timer);
    this.responseTimers.clear();
    callback(error);
  }
}

const config = {
  host: 'smtp.test',
  port: 465,
  secure: true,
  user: 'smtp-user',
  password: 'smtp-password',
  from: 'sender@example.com',
  to: 'contact@example.com',
  resetBaseUrl: 'https://portfoliogenerate.test',
  allowInsecureResetUrl: false,
};

const operationDeadlineMs = 30;
const testWatchdogMs = 150;
const sockets: ScriptedSmtpSocket[] = [];

afterEach(() => {
  for (const activeSocket of sockets) activeSocket.destroy();
  sockets.length = 0;
  vi.clearAllMocks();
  vi.useRealTimers();
});

function installSocket(
  stallAt: StallStage | null,
  responseDelayMs = 0,
  errorAfterStage: StallStage | null = null,
): ScriptedSmtpSocket {
  const socket = new ScriptedSmtpSocket(stallAt, responseDelayMs, errorAfterStage);
  sockets.push(socket);
  tls.connect.mockImplementation(() => {
    if (stallAt !== 'CONNECT') {
      queueMicrotask(() => {
        socket.emit('connect');
        socket.emit('secureConnect');
        queueMicrotask(() => socket.push(Buffer.from('220 smtp.test\r\n')));
      });
    }
    return socket;
  });
  return socket;
}

function installStartTlsSockets(): {
  readonly rawSocket: ScriptedSmtpSocket;
  readonly securedSocket: ScriptedSmtpSocket;
} {
  const rawSocket = new ScriptedSmtpSocket(null);
  const securedSocket = new ScriptedSmtpSocket('CONNECT');
  sockets.push(rawSocket, securedSocket);
  network.connect.mockImplementation(() => {
    queueMicrotask(() => {
      rawSocket.emit('connect');
      queueMicrotask(() => rawSocket.push(Buffer.from('220 smtp.test\r\n')));
    });
    return rawSocket;
  });
  tls.connect.mockReturnValue(securedSocket);
  return { rawSocket, securedSocket };
}

async function settleBeforeWatchdog(operation: Promise<void>): Promise<unknown> {
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  const outcome = await Promise.race([
    captureOutcome(operation),
    new Promise<Error>((resolve) => {
      watchdog = setTimeout(() => {
        for (const activeSocket of sockets) activeSocket.destroy();
        resolve(new Error('SMTP test watchdog expired'));
      }, testWatchdogMs);
    }),
  ]);
  if (watchdog !== undefined) clearTimeout(watchdog);
  return outcome;
}

async function captureOutcome(operation: Promise<void>): Promise<unknown> {
  try {
    await operation;
    return null;
  } catch (error) {
    return error;
  }
}

function sendVerification(): Promise<void> {
  return createSmtpEmailSender(config, operationDeadlineMs).sendEmailVerification({
    email: 'owner@example.com',
    verificationUrl: 'https://portfoliogenerate.test/api/auth/verify-email?token=private',
  });
}

describe('SMTP operation deadline', () => {
  it.each(['CONNECT', 'AUTH', 'MAIL', 'RCPT', 'DATA', 'BODY', 'QUIT'] as const)(
    'destroys a delivery socket when %s exceeds the whole-session deadline',
    async (stage) => {
      const stalledSocket = installSocket(stage);

      const outcome = await settleBeforeWatchdog(sendVerification());

      expect(outcome).toEqual(new Error('SMTP operation timed out'));
      expect((outcome as Error).message).not.toContain(config.user);
      expect((outcome as Error).message).not.toContain(config.password);
      expect(stalledSocket.destroyed).toBe(true);
      expect(stalledSocket.destructionCount).toBe(1);
    },
  );

  it('keeps the readiness deadline active through QUIT', async () => {
    const stalledSocket = installSocket('QUIT');

    const outcome = await settleBeforeWatchdog(
      createSmtpEmailSender(config).checkReadiness(operationDeadlineMs),
    );

    expect(outcome).toEqual(new Error('SMTP operation timed out'));
    expect(stalledSocket.destroyed).toBe(true);
    expect(stalledSocket.destructionCount).toBe(1);
  });

  it('completes a delivery and releases its socket before the deadline', async () => {
    vi.useFakeTimers();
    const successfulSocket = installSocket(null);

    const outcome = await settleBeforeWatchdog(sendVerification());

    expect(outcome).toBeNull();
    expect(successfulSocket.commands).toContain('QUIT');
    expect(successfulSocket.commands.some((command) => command.includes('\r\nSubject:'))).toBe(
      true,
    );
    expect(successfulSocket.destroyed).toBe(true);
    expect(successfulSocket.destructionCount).toBe(1);
    expect(successfulSocket.listenerCount('error')).toBe(0);
    expect(successfulSocket.listenerCount('data')).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('uses one cumulative deadline instead of resetting time for each SMTP stage', async () => {
    vi.useFakeTimers();
    const delayedSocket = installSocket(null, 10);
    const operation = sendVerification();
    const outcome = captureOutcome(operation);

    await vi.advanceTimersByTimeAsync(operationDeadlineMs - 1);

    expect(delayedSocket.destructionCount).toBe(0);
    expect(delayedSocket.commands).toContain(Buffer.from(config.user).toString('base64'));

    await vi.advanceTimersByTimeAsync(1);

    expect(await outcome).toEqual(new Error('SMTP operation timed out'));
    expect(delayedSocket.destructionCount).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('moves deadline ownership to the STARTTLS socket and destroys it on handshake timeout', async () => {
    vi.useFakeTimers();
    const { rawSocket, securedSocket } = installStartTlsSockets();
    const startTlsConfig = { ...config, secure: false };
    const operation = createSmtpEmailSender(startTlsConfig).checkReadiness(operationDeadlineMs);
    const outcome = captureOutcome(operation);

    await vi.advanceTimersByTimeAsync(0);
    for (let index = 0; index < 30; index += 1) await Promise.resolve();

    expect(network.connect).toHaveBeenCalledWith(config.port, config.host);
    expect(rawSocket.commands).toContain('STARTTLS');
    expect(tls.connect).toHaveBeenCalledWith({ socket: rawSocket, servername: config.host });
    expect(rawSocket.listenerCount('error')).toBe(0);
    expect(securedSocket.listenerCount('error')).toBeGreaterThan(0);

    await vi.advanceTimersByTimeAsync(operationDeadlineMs);

    expect(await outcome).toEqual(new Error('SMTP operation timed out'));
    expect(rawSocket.destructionCount).toBe(0);
    expect(securedSocket.destructionCount).toBe(1);
    expect(securedSocket.errorListenersBeforeDestroy).toBeGreaterThan(0);
    expect(securedSocket.listenerCount('error')).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('contains a socket error emitted immediately after a successful response', async () => {
    const failedSocket = installSocket(null, 0, 'MAIL');

    const outcome = await settleBeforeWatchdog(sendVerification());

    expect(outcome).toEqual(new Error('SMTP socket failed after response'));
    expect(failedSocket.unhandledErrors).toEqual([]);
    expect(failedSocket.destructionCount).toBe(1);
    expect(failedSocket.listenerCount('error')).toBe(0);
  });
});
