import 'server-only';

import { connect } from 'node:net';
import type { Duplex } from 'node:stream';
import { connect as connectTls, type ConnectionOptions } from 'node:tls';

import { SMTP_READY_STATUSES, SMTP_TIMEOUT_MS } from './email.constants';
import type {
  ContactEmail,
  EmailSender,
  EmailVerificationEmail,
  PasswordResetEmail,
} from './email.types';

interface SmtpConfiguration {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly password: string;
  readonly from: string;
  readonly to: string;
  readonly resetBaseUrl: string;
  readonly allowInsecureResetUrl: boolean;
}

function encodeHeader(value: string): string {
  return `=?UTF-8?B?${Buffer.from(value).toString('base64')}?=`;
}

function dotStuff(value: string): string {
  return value.replaceAll('\r\n', '\n').replaceAll('\r', '\n').replaceAll(/^\./gmu, '..');
}

const SMTP_TIMEOUT_MESSAGE = 'SMTP operation timed out';
const SMTP_CLOSED_MESSAGE = 'SMTP connection closed unexpectedly';

class SmtpSessionDeadline {
  private readonly controller = new AbortController();
  private readonly timer: ReturnType<typeof setTimeout>;
  private socket: Duplex | undefined;
  private readonly onSocketError = (error: Error): void => {
    this.abort(error);
  };
  readonly signal: AbortSignal;
  readonly timeoutError = new Error(SMTP_TIMEOUT_MESSAGE);

  constructor(timeoutMs: number) {
    this.signal = this.controller.signal;
    this.timer = setTimeout(() => {
      this.abort(this.timeoutError);
    }, timeoutMs);
    this.timer.unref();
  }

  private abort(error: Error): void {
    if (this.signal.aborted) return;
    this.controller.abort(error);
    this.socket?.destroy();
  }

  own(socket: Duplex): void {
    this.socket?.off('error', this.onSocketError);
    this.socket = socket;
    socket.on('error', this.onSocketError);
    if (this.signal.aborted) socket.destroy();
  }

  throwIfAborted(): void {
    if (this.signal.aborted) throw deadlineError(this);
  }

  dispose(): void {
    clearTimeout(this.timer);
    const socket = this.socket;
    this.socket = undefined;
    socket?.off('error', this.onSocketError);
    socket?.destroy();
  }
}

function deadlineError(deadline: SmtpSessionDeadline): Error {
  return deadline.signal.reason instanceof Error ? deadline.signal.reason : deadline.timeoutError;
}

function waitForSocketEvent(
  socket: Duplex,
  event: 'connect' | 'secureConnect',
  deadline: SmtpSessionDeadline,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const onReady = (): void => {
      settle(resolve);
    };
    const onClose = (): void => {
      settle(() => {
        reject(new Error(SMTP_CLOSED_MESSAGE));
      });
    };
    const onAbort = (): void => {
      settle(() => {
        reject(deadlineError(deadline));
      });
    };
    const cleanup = (): void => {
      socket.off(event, onReady);
      socket.off('close', onClose);
      deadline.signal.removeEventListener('abort', onAbort);
    };
    let settled = false;
    const settle = (result: () => void): void => {
      if (settled) return;
      settled = true;
      cleanup();
      result();
    };

    socket.once(event, onReady);
    socket.once('close', onClose);
    deadline.signal.addEventListener('abort', onAbort, { once: true });
    if (deadline.signal.aborted) onAbort();
  });
}

function waitForResponse(
  socket: Duplex,
  expected: readonly number[],
  deadline: SmtpSessionDeadline,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let response = '';
    const onData = (chunk: Buffer): void => {
      response += chunk.toString('utf8');
      const lines = response.split('\r\n').filter(Boolean);
      const last = lines.at(-1);

      if (!last || !/^\d{3} /.test(last)) return;
      cleanup();
      const status = Number(last.slice(0, 3));
      if (expected.includes(status)) resolve(response);
      else reject(new Error(`SMTP command failed with status ${status}`));
    };
    const onClose = (): void => {
      cleanup();
      reject(new Error(SMTP_CLOSED_MESSAGE));
    };
    const onAbort = (): void => {
      cleanup();
      reject(deadlineError(deadline));
    };
    const cleanup = (): void => {
      socket.off('data', onData);
      socket.off('close', onClose);
      deadline.signal.removeEventListener('abort', onAbort);
    };
    socket.on('data', onData);
    socket.once('close', onClose);
    deadline.signal.addEventListener('abort', onAbort, { once: true });
    if (deadline.signal.aborted) onAbort();
  });
}

async function command(
  socket: Duplex,
  value: string,
  expected: readonly number[],
  deadline: SmtpSessionDeadline,
): Promise<void> {
  deadline.throwIfAborted();
  const response = waitForResponse(socket, expected, deadline);
  socket.write(`${value}\r\n`);
  await response;
  deadline.throwIfAborted();
}

async function openSocket(
  config: SmtpConfiguration,
  deadline: SmtpSessionDeadline,
): Promise<Duplex> {
  const options: ConnectionOptions = {
    host: config.host,
    port: config.port,
    servername: config.host,
  };
  const socket = config.secure ? connectTls(options) : connect(config.port, config.host);
  deadline.own(socket);
  await waitForSocketEvent(socket, config.secure ? 'secureConnect' : 'connect', deadline);
  return socket;
}

async function upgradeToTls(
  socket: Duplex,
  host: string,
  deadline: SmtpSessionDeadline,
): Promise<Duplex> {
  const secured = connectTls({ socket, servername: host });
  deadline.own(secured);
  await waitForSocketEvent(secured, 'secureConnect', deadline);
  return secured;
}

async function runSmtpSession<T>(
  config: SmtpConfiguration,
  timeoutMs: number,
  operation: (socket: Duplex, deadline: SmtpSessionDeadline) => Promise<T>,
): Promise<T> {
  const deadline = new SmtpSessionDeadline(timeoutMs);
  try {
    let socket = await openSocket(config, deadline);
    await waitForResponse(socket, SMTP_READY_STATUSES.greeting, deadline);
    await command(socket, 'EHLO portfolio-generate', SMTP_READY_STATUSES.ehlo, deadline);
    if (!config.secure) {
      await command(socket, 'STARTTLS', SMTP_READY_STATUSES.startTls, deadline);
      socket = await upgradeToTls(socket, config.host, deadline);
      await command(socket, 'EHLO portfolio-generate', SMTP_READY_STATUSES.ehlo, deadline);
    }
    await command(socket, 'AUTH LOGIN', SMTP_READY_STATUSES.authChallenge, deadline);
    await command(
      socket,
      Buffer.from(config.user).toString('base64'),
      SMTP_READY_STATUSES.authChallenge,
      deadline,
    );
    await command(
      socket,
      Buffer.from(config.password).toString('base64'),
      SMTP_READY_STATUSES.authenticated,
      deadline,
    );
    const result = await operation(socket, deadline);
    deadline.throwIfAborted();
    return result;
  } catch (error) {
    if (deadline.signal.aborted) throw deadlineError(deadline);
    throw error;
  } finally {
    deadline.dispose();
  }
}

interface MailContent {
  readonly recipient: string;
  readonly replyTo?: string;
  readonly subject: string;
  readonly body: string;
}

function assertSafeAddress(address: string): void {
  if (/[\r\n]/u.test(address)) throw new Error('Email address contains a line break');
}

async function send(
  config: SmtpConfiguration,
  message: MailContent,
  timeoutMs: number,
): Promise<void> {
  assertSafeAddress(message.recipient);
  await runSmtpSession(config, timeoutMs, async (socket, deadline) => {
    await command(socket, `MAIL FROM:<${config.from}>`, [250], deadline);
    await command(socket, `RCPT TO:<${message.recipient}>`, [250, 251], deadline);
    await command(socket, 'DATA', [354], deadline);

    const body = [
      `From: ${config.from}`,
      `To: ${message.recipient}`,
      ...(message.replyTo ? [`Reply-To: ${message.replyTo}`] : []),
      `Subject: ${encodeHeader(message.subject)}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 8bit',
      '',
      dotStuff(message.body),
    ].join('\r\n');
    await command(socket, `${body}\r\n.`, [250], deadline);
    await command(socket, 'QUIT', [221], deadline);
  });
}

export function createSmtpEmailSender(
  config: SmtpConfiguration,
  timeoutMs = SMTP_TIMEOUT_MS,
): EmailSender {
  return {
    checkReadiness: (readinessTimeoutMs: number) =>
      runSmtpSession(config, readinessTimeoutMs, async (socket, deadline) => {
        await command(socket, 'QUIT', SMTP_READY_STATUSES.quit, deadline);
      }),
    sendContact: (message: ContactEmail) =>
      send(
        config,
        {
          recipient: config.to,
          replyTo: message.email,
          subject: message.subject,
          body: `Name: ${message.name}\nEmail: ${message.email}\n\n${message.message}`,
        },
        timeoutMs,
      ),
    sendPasswordReset: (message: PasswordResetEmail) =>
      send(
        config,
        {
          recipient: message.email,
          subject: 'Reset your PortfolioGenerate password',
          body: `Use this secure link to choose a new password:\n\n${message.resetUrl}\n\nIf you did not request this, you can ignore this message.`,
        },
        timeoutMs,
      ),
    sendEmailVerification: (message: EmailVerificationEmail) =>
      send(
        config,
        {
          recipient: message.email,
          subject: 'Verify your PortfolioGenerate email',
          body: `Use this secure link to verify your email address:\n\n${message.verificationUrl}\n\nIf you did not create this account, you can ignore this message.`,
        },
        timeoutMs,
      ),
  };
}
