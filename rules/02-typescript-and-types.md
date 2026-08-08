# 02 — TypeScript

## Two compilers, on purpose

- `@typescript/native` (TypeScript 7) is the gate for application code. It is
  what `npm run build` runs first and what CI blocks on.
- `typescript` (TypeScript 6) is installed because typescript-eslint and Next's
  build-time check cannot yet run on 7. `npm run typecheck:compat` runs it over
  the same projects so the two cannot silently disagree.

Nothing was downgraded to make this work. The application is checked by 7; 6 is
a tooling dependency with its own gate.

## Strictness

`strict`, plus:

- **`exactOptionalPropertyTypes`** — `{ a?: string }` does not accept
  `{ a: undefined }`. This matters most at the Prisma boundary, where an
  explicit `undefined` in an update payload means "set to undefined" rather
  than "leave alone".
- **`noUncheckedIndexedAccess`** — `array[0]` is `T | undefined`. Handle it.
  Non-null assertions are banned by lint; narrow, or throw with a message that
  names the invariant.
- **`verbatimModuleSyntax`** — `import type` is explicit, so a type-only
  import never survives into the emitted graph.

## Modelling

**Required and nullable, not optional.** Every field of `PortfolioDocument` is
present and may be `null`. A missing key and an empty value are the same fact to
a reader, and modelling them as one removes an entire class of
"sometimes undefined" bugs from the editor.

**Discriminated unions over booleans.** `{ ok: true, value }` /
`{ ok: false, reason }` makes the failure cases exhaustive and lets the compiler
find the caller that forgot one.

**Parse, do not cast.** `as` on data that came from a database, a form or a
model is a lie the compiler cannot check. Everything crossing a boundary goes
through a schema.
