# Gemini CLI / Code Assist

**Read [AGENTS.md](./AGENTS.md) first.** It is the canonical instruction set for
this repository: architecture, non-negotiables, commands, and where things live.
This file only adds what is specific to Gemini CLI / Code Assist.

## Notes for Gemini CLI / Code Assist

Gemini tends to reach for broad refactors. Do not.

- Change the smallest set of files that solves the stated problem.
- Do not reorganise directories: the layer names are load-bearing, and the lint
  rules key on them.
- Do not add a dependency without a wrapper in `src/packages/` and an entry in
  `eslint/package-boundaries.config.mjs`.

## The short version

- Nothing is invented. A field the CV does not contain stays empty.
- A person reviews before anything is public.
- A published portfolio is a database read and nothing else.
- Never add an `eslint-disable` comment. Exceptions go in
  `eslint/exceptions.config.mjs` with an id and a reason.
- Never weaken a gate to make it pass.
