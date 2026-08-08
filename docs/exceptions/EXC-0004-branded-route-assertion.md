# EXC-0004 — The branded `Route` assertion

**Rule:** `@typescript-eslint/no-unnecessary-type-assertion`
**Scope:** `src/packages/link/index.tsx`

## Why the rule fires

`toAppRoute` widens a database-derived string to the branded `Route` type that
`typedRoutes` generates. The TypeScript 6 API that typescript-eslint runs on
resolves `Route` to `string`, so it sees the assertion as unnecessary.

## Why it does not apply

TypeScript 7 — the compiler that gates the build — sees the brand and requires
the assertion. The two compilers genuinely disagree here, and the gate that
matters is the one that compiles the application. See
[ADR-0004](../../architecture/adrs/0004-two-typescript-compilers.md).

## What would make this exception wrong

typescript-eslint gaining TypeScript 7 support. At that point the disagreement
disappears and the exception should be deleted.
