import { APP_LOCALE } from '@/packages/i18n';

import type { SessionDeviceTokenPattern } from '../types/session-view.types';

// Order matters: Edge and Opera both carry a "Chrome" token, every WebKit
// browser carries a "Safari" token, and Chrome itself carries a "Safari"
// token — so the more specific engines have to be checked first, or they are
// never reached.
export const SESSION_BROWSER_PATTERNS: readonly SessionDeviceTokenPattern[] = [
  { label: 'Edge', test: /Edg\// },
  { label: 'Opera', test: /OPR\/|Opera/ },
  { label: 'Samsung Internet', test: /SamsungBrowser\// },
  { label: 'Firefox', test: /Firefox\// },
  { label: 'Chrome', test: /Chrome\// },
  { label: 'Safari', test: /Version\/.*Safari\// },
];

// Same reasoning: Android's UA string also contains "Linux", so Android has
// to be tested before the generic Linux fallback.
export const SESSION_OS_PATTERNS: readonly SessionDeviceTokenPattern[] = [
  { label: 'Windows', test: /Windows NT/ },
  { label: 'Android', test: /Android/ },
  { label: 'iOS', test: /iPhone|iPad|iPod/ },
  { label: 'macOS', test: /Mac OS X/ },
  { label: 'Chrome OS', test: /CrOS/ },
  { label: 'Linux', test: /Linux/ },
];

/**
 * A signed-in-device timestamp formatter, fixed rather than ambient.
 *
 * The locale is the platform UI locale (`APP_LOCALE`), and the time zone is
 * pinned to UTC rather than left to the runtime default. The security section
 * renders on the server before it hydrates on the client; a formatter that
 * resolved the visitor's local zone would format the same instant two
 * different ways within that one render, which is a hydration mismatch, not a
 * display bug.
 */
export const SESSION_TIMESTAMP_FORMATTER = new Intl.DateTimeFormat(APP_LOCALE, {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
});
