# GLM / Zhipu

**Read [AGENTS.md](./AGENTS.md) first.** It is the canonical instruction set for
this repository: architecture, non-negotiables, commands, and where things live.
This file only adds what is specific to GLM / Zhipu.

## Notes for GLM / Zhipu

Two things this repository does that are easy to miss:

- Zod is behind `@/packages/zod` and `parseSchema` returns a discriminated
  result. Nothing throws on invalid input; check `.ok`.
- All user-facing copy lives in `src/packages/i18n/messages/en.json` and is
  reached by key. A literal string in a component fails lint.

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
