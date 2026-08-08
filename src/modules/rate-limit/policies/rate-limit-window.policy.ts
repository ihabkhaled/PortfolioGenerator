/**
 * Fixed windows, aligned to the clock.
 *
 * A daily quota that resets 24 hours after a user's first import is impossible
 * to explain and impossible to support ("it said tomorrow, it's tomorrow").
 * Aligning to UTC midnight makes the answer to "when does this reset" a date,
 * and makes the counter row shared and cheap.
 */

export function windowStart(now: Date, windowSeconds: number): Date {
  const windowMilliseconds = windowSeconds * 1000;

  return new Date(Math.floor(now.getTime() / windowMilliseconds) * windowMilliseconds);
}

export function windowEnd(now: Date, windowSeconds: number): Date {
  return new Date(windowStart(now, windowSeconds).getTime() + windowSeconds * 1000);
}

export function buildBucketKey(kind: string, subject: string): string {
  return `${kind}:${subject}`;
}
