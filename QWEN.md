# Qwen Code

**Read [AGENTS.md](./AGENTS.md) first.** It is the canonical instruction set for
this repository: architecture, non-negotiables, commands, and where things live.
This file only adds what is specific to Qwen Code.

## Notes for Qwen Code

Start with `AGENTS.md`. Then, before writing:

- `npm run lint` tells you the architecture rules by name and points at the
  layer you violated. Read the message; it usually contains the fix.
- Every module has an `index.ts` that lists what is public. If what you need
  is not exported, decide whether it should be — do not deep-import.

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
