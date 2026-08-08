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
