import {
  SESSION_BROWSER_PATTERNS,
  SESSION_OS_PATTERNS,
  SESSION_TIMESTAMP_FORMATTER,
} from '../constants/session-view.constants';
import type { SessionDeviceTokenPattern } from '../types/session-view.types';

/** The first pattern whose token appears in `userAgent`, checked in table order. */
export function matchSessionDeviceToken(
  patterns: readonly SessionDeviceTokenPattern[],
  userAgent: string,
): string | null {
  return patterns.find((pattern) => pattern.test.test(userAgent))?.label ?? null;
}

/**
 * A short, readable label for a stored `User-Agent` string.
 *
 * No parsing library is pulled in for this: the signed-in-devices list needs
 * a one-line "Chrome on Windows" label, not full UA-string decomposition, and
 * a heuristic covering the handful of browsers and platforms real visitors
 * actually send is proportional to that. A string this heuristic does not
 * recognise is returned unchanged rather than folded into a generic
 * "Unknown" bucket — the raw value is still more informative than a label
 * that erases it, and it keeps this function's contract simple: input in,
 * something displayable out, never null unless the input was.
 */
export function describeSessionDevice(userAgent: string | null): string | null {
  if (userAgent === null || userAgent.trim() === '') {
    return null;
  }

  const browser = matchSessionDeviceToken(SESSION_BROWSER_PATTERNS, userAgent);
  const os = matchSessionDeviceToken(SESSION_OS_PATTERNS, userAgent);

  if (browser === null) {
    return os ?? userAgent;
  }

  return os === null ? browser : `${browser} on ${os}`;
}

/** A signed-in-device timestamp, not a raw ISO instant. See `SESSION_TIMESTAMP_FORMATTER`. */
export function formatSessionTimestamp(value: Date): string {
  return SESSION_TIMESTAMP_FORMATTER.format(value);
}
