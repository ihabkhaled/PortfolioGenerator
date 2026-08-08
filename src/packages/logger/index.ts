/**
 * The single owner of console output.
 *
 * Every entry is a bounded structured event. Raw CV text, extracted document
 * bodies, tokens and email addresses must never be passed here: logs are the
 * easiest place to accidentally turn a private document into a durable,
 * widely-readable artifact.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogFields = Readonly<Record<string, string | number | boolean | null | undefined>>;

function emit(level: LogLevel, event: string, fields: LogFields): void {
  const payload = JSON.stringify({ level, event, ...fields, at: new Date().toISOString() });

  if (level === 'error') {
    console.error(payload);

    return;
  }

  if (level === 'warn') {
    console.warn(payload);

    return;
  }

  console.log(payload);
}

export const logger = {
  debug(event: string, fields: LogFields = {}): void {
    emit('debug', event, fields);
  },
  info(event: string, fields: LogFields = {}): void {
    emit('info', event, fields);
  },
  warn(event: string, fields: LogFields = {}): void {
    emit('warn', event, fields);
  },
  error(event: string, fields: LogFields = {}): void {
    emit('error', event, fields);
  },
} as const;
