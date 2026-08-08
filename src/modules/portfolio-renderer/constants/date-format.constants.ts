/**
 * Month names for `YYYY-MM` display.
 *
 * A fixed English list rather than `Intl`: see the note in
 * `date-range.helper.ts` — a month is not an instant, and constructing a Date
 * to format one silently shifts employment dates across timezones. When
 * portfolio content languages land, this becomes a per-language table, not a
 * Date-based formatter.
 */
export const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
