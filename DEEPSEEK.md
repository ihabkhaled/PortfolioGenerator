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
