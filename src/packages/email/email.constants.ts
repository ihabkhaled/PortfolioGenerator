export const SMTP_TIMEOUT_MS = 15_000;

export const SMTP_READY_STATUSES = {
  greeting: [220],
  ehlo: [250],
  startTls: [220],
  authChallenge: [334],
  authenticated: [235],
  quit: [221],
} as const;
