# DeepSeek

**Read [AGENTS.md](./AGENTS.md) first.** It is the canonical instruction set for
this repository: architecture, non-negotiables, commands, and where things live.
This file only adds what is specific to DeepSeek.

## Notes for DeepSeek

The strictness here is deliberate and mostly mechanical.

- `exactOptionalPropertyTypes` and `noUncheckedIndexedAccess` are on. An
  index access is possibly undefined; handle it rather than asserting it away.
- Non-null assertions (`!`) are forbidden by lint. Narrow, or throw with a
  message that names the invariant.

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
