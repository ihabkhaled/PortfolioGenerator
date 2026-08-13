# Cursor

**Read [AGENTS.md](./AGENTS.md) first.** It is the canonical instruction set for
this repository: architecture, non-negotiables, commands, and where things live.
This file only adds what is specific to Cursor.

## Notes for Cursor

Cursor rules also live in `.cursor/rules/` as scoped `.mdc` files, so the
right guidance loads for the file being edited. `.cursorrules` is kept as a
fallback for older versions.

- Composer edits across many files easily; the layer rules will catch a change
  that crosses a boundary, so run `npm run lint` before accepting a multi-file
  edit.

## The short version

- Nothing is invented. A field the CV does not contain stays empty.
- A person reviews before anything is public.
- A published portfolio is a database read and nothing else.
- Never add an `eslint-disable` comment. Exceptions go in
  `eslint/exceptions.config.mjs` with an id and a reason.
- Never weaken a gate to make it pass.

## Communication — mandatory

Follow [rules/08-communication-style.md](./rules/08-communication-style.md);
templates in [skills/communicate-briefly.md](./skills/communicate-briefly.md).

- 1–5 short lines by default.
- Name the exact file, error, count or blocker.
- A blocker starts with `Blocked:`.
- `Done.` carries its proof.
- No filler openers, no fake background work.

## Executive function — mandatory

Follow [rules/09-executive-function.md](./rules/09-executive-function.md);
recover from a stall with
[skills/recover-from-a-loop.md](./skills/recover-from-a-loop.md).

- State objective, Definition of Done and scope before deep reasoning.
- Classify discoveries: only `BLOCKER`/`REQUIRED` may interrupt.
- Respect the nesting, retry and critic budgets.
- Stop when done — completion is not an invitation to find more work.
