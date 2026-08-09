/**
 * Index into a query result without a non-null assertion.
 *
 * `getAllByRole` returns an array, and under `noUncheckedIndexedAccess` every
 * index is possibly undefined. Asserting it away with `!` would trade a real
 * guarantee for terseness and turn "the button was not rendered" into a
 * confusing null-property error three lines later. Throwing names the problem.
 */
export function requireElement<TElement>(
  candidate: TElement | null | undefined,
  what = 'element',
): TElement {
  if (candidate === undefined || candidate === null) {
    throw new Error(`Expected a ${what} to be in the document`);
  }

  return candidate;
}
