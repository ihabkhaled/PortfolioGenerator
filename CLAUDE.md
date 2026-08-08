# Claude Code

**Read [AGENTS.md](./AGENTS.md) first.** It is the canonical instruction set for
this repository: architecture, non-negotiables, commands, and where things live.
This file only adds what is specific to Claude Code.

## Notes for Claude Code

Claude Code reads this file automatically at the start of a session.

- Prefer the dedicated file tools over shell commands; they integrate with the
  permission UI and produce clickable references.
- Run `npm run lint` and `npm run typecheck:app` after a change rather than
  the full `quality` script — the fast pair catches almost everything and takes
  seconds.
- The full gate (`npm run validate`) needs Docker Postgres on port 5433 and a
  Chromium install; run it before handing work over, not after every edit.

## The short version

- Nothing is invented. A field the CV does not contain stays empty.
- A person reviews before anything is public.
- A published portfolio is a database read and nothing else.
- Never add an `eslint-disable` comment. Exceptions go in
  `eslint/exceptions.config.mjs` with an id and a reason.
- Never weaken a gate to make it pass.
