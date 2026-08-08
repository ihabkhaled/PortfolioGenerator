/**
 * Small string operations written without regular expressions.
 *
 * Trimming a repeated character at a string boundary is exactly the shape that
 * backtracks super-linearly when written as an anchored `+` pattern, and these
 * run on user-supplied input on every save. A loop is both faster and provably
 * linear.
 */

export function trimCharacter(value: string, character: string): string {
  let start = 0;
  let end = value.length;

  while (start < end && value[start] === character) {
    start += 1;
  }

  while (end > start && value[end - 1] === character) {
    end -= 1;
  }

  return value.slice(start, end);
}

/** Case-insensitive, locale-aware comparator for stable, readable sorted lists. */
export function compareAlphabetically(left: string, right: string): number {
  return left.localeCompare(right, 'en');
}
