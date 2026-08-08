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
