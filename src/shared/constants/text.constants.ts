/**
 * Characters removed from every stored text field.
 *
 * C0/C1 control characters, zero-width and bidirectional-override marks, and
 * the line/paragraph separators. None of them belong in a CV; all of them are
 * standard material for spoofing a rendered string, breaking a log line, or
 * making a slug look like something it is not. Tab, newline and carriage
 * return survive on purpose — multi-line summaries are legitimate content.
 *
 * Two constants because a global regular expression carries `lastIndex`
 * between calls: sharing one instance between `test` and `replaceAll` makes
 * the test return alternating answers for the same input.
 */
export const CONTROL_CHARACTER_PATTERN =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2028\u2029\u2066-\u2069\uFEFF]/u;

export const CONTROL_CHARACTER_GLOBAL_PATTERN =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2028\u2029\u2066-\u2069\uFEFF]/gu;

/** Collapses runs of spaces and tabs while preserving paragraph breaks. */
export const REPEATED_INLINE_WHITESPACE_PATTERN = /[^\S\r\n]{2,}/gu;

/** Three or more consecutive newlines collapse to a single paragraph break. */
export const REPEATED_NEWLINE_PATTERN = /\n{3,}/gu;
