import 'server-only';

import { connect } from 'node:net';
import type { Duplex } from 'node:stream';
import { connect as connectTls, type ConnectionOptions } from 'node:tls';

import { SMTP_TIMEOUT_MS } from './email.constants';
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

function waitForResponse(socket: Duplex, expected: readonly number[]): Promise<string> {
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
    const onError = (error: Error): void => {
      cleanup();
      reject(error);
    };
    const cleanup = (): void => {
      socket.off('data', onData);
      socket.off('error', onError);
    };
    socket.on('data', onData);
    socket.on('error', onError);
  });
}

async function command(socket: Duplex, value: string, expected: readonly number[]): Promise<void> {
  const response = waitForResponse(socket, expected);
  socket.write(`${value}\r\n`);
  await response;
}

function openSocket(config: SmtpConfiguration): Promise<Duplex> {
  return new Promise((resolve, reject) => {
    const options: ConnectionOptions = {
      host: config.host,
      port: config.port,
      servername: config.host,
    };
    const socket = config.secure ? connectTls(options) : connect(config.port, config.host);
    socket.setTimeout(SMTP_TIMEOUT_MS, () => {
      socket.destroy(new Error('SMTP connection timed out'));
    });
    socket.once('connect', () => {
      resolve(socket);
    });
    socket.once('error', reject);
  });
}

async function upgradeToTls(socket: Duplex, host: string): Promise<Duplex> {
  return new Promise((resolve, reject) => {
    const secured = connectTls({ socket, servername: host }, () => {
      resolve(secured);
    });
    secured.setTimeout(SMTP_TIMEOUT_MS, () => {
      secured.destroy(new Error('SMTP connection timed out'));
    });
    secured.once('error', reject);
  });
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

async function send(config: SmtpConfiguration, message: MailContent): Promise<void> {
  assertSafeAddress(message.recipient);
  let socket = await openSocket(config);
  try {
    await waitForResponse(socket, [220]);
    await command(socket, 'EHLO portfolio-generate', [250]);
    if (!config.secure) {
      await command(socket, 'STARTTLS', [220]);
      socket = await upgradeToTls(socket, config.host);
      await command(socket, 'EHLO portfolio-generate', [250]);
    }
    await command(socket, 'AUTH LOGIN', [334]);
    await command(socket, Buffer.from(config.user).toString('base64'), [334]);
    await command(socket, Buffer.from(config.password).toString('base64'), [235]);
    await command(socket, `MAIL FROM:<${config.from}>`, [250]);
    await command(socket, `RCPT TO:<${message.recipient}>`, [250, 251]);
    await command(socket, 'DATA', [354]);

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
    await command(socket, `${body}\r\n.`, [250]);
    await command(socket, 'QUIT', [221]);
  } finally {
    socket.destroy();
  }
}

export function createSmtpEmailSender(config: SmtpConfiguration): EmailSender {
  return {
    sendContact: (message: ContactEmail) =>
      send(config, {
        recipient: config.to,
        replyTo: message.email,
        subject: message.subject,
        body: `Name: ${message.name}\nEmail: ${message.email}\n\n${message.message}`,
      }),
    sendPasswordReset: (message: PasswordResetEmail) =>
      send(config, {
        recipient: message.email,
        subject: 'Reset your PortfolioGenerate password',
        body: `Use this secure link to choose a new password:\n\n${message.resetUrl}\n\nIf you did not request this, you can ignore this message.`,
      }),
    sendEmailVerification: (message: EmailVerificationEmail) =>
      send(config, {
        recipient: message.email,
        subject: 'Verify your PortfolioGenerate email',
        body: `Use this secure link to verify your email address:\n\n${message.verificationUrl}\n\nIf you did not create this account, you can ignore this message.`,
      }),
  };
}
