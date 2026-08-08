# ADR-0004 — TypeScript 7 for the app, TypeScript 6 for the tooling

- **Status:** Accepted
- **Date:** 2026-08-09

## Context

The project targets TypeScript 7 (`@typescript/native`). Two tools cannot
run on it yet: typescript-eslint throws on the 7.0 API, and Next's build-time
type check invokes `typescript/bin/tsc` by path.

Downgrading the project to 6 would have removed the constraint at the cost of
the thing the project was asked to use.

## Decision

Both are installed. `typescript` (6.x) satisfies the tools;
`@typescript/native` (7.x) is aliased and is what `npm run typecheck:app` and
`npm run build` run first.

`npm run typecheck:compat` runs the 6.x compiler over the same projects, so the
two cannot silently disagree about the code that ships.

## Consequences

- Application code is checked by 7, which is the gate that matters.
- Lint and the Next build keep working.
- One documented exception exists where the compilers genuinely disagree
  (`EXC-0004`, the branded-`Route` assertion in `packages/link`), and it is
  scoped to a single file.
- The dual install is a temporary state, and the day typescript-eslint supports
  7 it is a one-line removal.

## Alternatives considered

**Downgrade to TypeScript 6.** Rejected: the brief specified 7, and 7 is the
stricter checker.

**Drop typescript-eslint.** Rejected: it is the source of the type-aware rules
that catch the errors a syntactic linter cannot.
