/**
 * Slug shape checking, written as a scan rather than a regular expression.
 *
 * `/^[a-z0-9]+(?:-[a-z0-9]+)*$/` is the obvious spelling and is also a nested
 * quantifier: on a long non-matching input it backtracks super-linearly, and
 * slug validation runs on unauthenticated input during availability checks. A
 * single pass over the string is linear by construction and states the three
 * rules — allowed characters, no edge hyphen, no double hyphen — in the order a
 * reader would check them.
 *
 * Indexing by UTF-16 unit rather than iterating code points is deliberate: the
 * allowlist is ASCII, so any multi-unit character fails on its first unit and
 * never needs to be reassembled.
 */

export function isSlugCharacter(character: string): boolean {
  return (character >= 'a' && character <= 'z') || (character >= '0' && character <= '9');
}

export function hasValidSlugShape(value: string): boolean {
  if (value.length === 0) {
    return false;
  }

  let wasHyphen = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];

    if (character === '-') {
      // No leading hyphen, no trailing hyphen, no `--`.
      if (wasHyphen || index === 0 || index === value.length - 1) {
        return false;
      }

      wasHyphen = true;

      continue;
    }

    if (character === undefined || !isSlugCharacter(character)) {
      return false;
    }

    wasHyphen = false;
  }

  return true;
}
