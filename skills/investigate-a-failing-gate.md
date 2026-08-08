# When the gate fails

`npm run validate` runs nine things. Which one failed tells you where to look.

## `format:check`

`npm run format` and commit. Note that `schemas/` is in `.prettierignore`: it
holds a generated snapshot, and formatting it would break its own test.

## `lint`

Read the rule name. The architecture rules say what they mean:

| Message                                                 | Means                                            |
| ------------------------------------------------------- | ------------------------------------------------ |
| "Deep import into module X internals"                   | Export it from a surface, or use one that exists |
| "Move this into the types/ layer"                       | The declaration belongs in `types/`              |
| "Move this local function into a dedicated helper file" | Pure-logic files export every function           |
| "Repositories … never call back up"                     | A layer is importing upward                      |
| "Raw className strings are forbidden here"              | Import a variant bundle                          |
| "Do not read process.env here"                          | Use `@/packages/env`                             |

Never reach for an inline disable — it will fail the severity check too.

## `typecheck`

`typecheck:app` is TypeScript 7 and is the one that matters. If `typecheck:compat`
fails alone, the two compilers disagree; see
[ADR-0004](../architecture/adrs/0004-two-typescript-compilers.md).

Note that `next build` typechecks the **test** files as well, so a type error in
a spec fails the build even though `typecheck:app` was clean.

## `test:coverage`

Which threshold failed is in the error line. If it is a pure layer, you are
missing a test for a real branch. If the branch is genuinely unreachable —
usually a `noUncheckedIndexedAccess` guard — mark it
`/* v8 ignore next -- reason */` and make the reason specific.

Never lower a threshold to pass.

## `quality:dead-code`

knip found an export nobody imports. Either use it or delete it. An export
"kept for later" is a maintenance cost with no user.

## `quality:circular`

Two modules import each other. The layer rules usually prevent this; a cycle
that got through means one of them is doing a job that belongs to the other.

## `test:e2e`

Read `test-results/<test>/error-context.md` — it contains the accessibility
snapshot of the page at the moment of failure, which is usually enough to see
what was actually on screen.

The suite runs one worker against a real database. A failure that only appears
in a full run and not alone is usually shared state: a slug, or an account.
