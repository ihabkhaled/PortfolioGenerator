import { MONTH_PATTERN } from '@/modules/portfolio-document';

import { MONTH_LABELS } from '../constants/date-format.constants';

/**
 * `YYYY-MM` to a readable range.
 *
 * Formatting is done here, not with `Intl.DateTimeFormat`, for one reason: a
 * `YYYY-MM` value is a *month*, not an instant. Turning it into a Date to
 * format it introduces a day and a timezone, and "2019-01" rendered in a
 * negative-offset zone becomes December 2018 — a wrong employment date on
 * someone's public CV.
 */

export function formatMonth(value: string | null): string | null {
  // The shape is checked here as well as in the schema. This helper is
  // exported, and a naive split turns `not-a-month` into the year "not" — a
  // plausible-looking wrong date is worse than no date at all.
  if (value === null || !MONTH_PATTERN.test(value)) {
    return null;
  }

  const [year, month] = value.split('-', 2);

  /* v8 ignore next 3 -- MONTH_PATTERN guarantees both parts; the compiler cannot see that. */
  if (year === undefined || month === undefined) {
    return null;
  }

  const label = MONTH_LABELS[Number(month) - 1];

  /* v8 ignore next -- the pattern bounds the month to 01-12, so a label always exists. */
  return label === undefined ? year : `${label} ${year}`;
}

/**
 * A role with no dates at all renders no date element rather than an empty
 * one — an em dash floating on a card reads as missing data, which is exactly
 * what a reviewer will assume was lost in extraction.
 */
export function formatDateRange(
  startDate: string | null,
  endDate: string | null,
  isCurrent: boolean,
  presentLabel: string,
): string {
  const start = formatMonth(startDate);
  const end = isCurrent ? presentLabel : formatMonth(endDate);

  if (start === null && end === null) {
    return '';
  }

  if (start === null) {
    /* v8 ignore next -- both null returned above, so end is a string here. */
    return end ?? '';
  }

  if (end === null) {
    return start;
  }

  return `${start} — ${end}`;
}
