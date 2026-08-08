# Kimi (Moonshot)

**Read [AGENTS.md](./AGENTS.md) first.** It is the canonical instruction set for
this repository: architecture, non-negotiables, commands, and where things live.
This file only adds what is specific to Kimi (Moonshot).

## Notes for Kimi (Moonshot)

Kimi has a long context window; use it to read before writing.

- `AGENTS.md`, `rules/`, and the module you are editing are the reading list.
- Prefer reading a whole module over grepping for a symbol: the surfaces file
  tells you what is public, and that is usually the answer.

## The short version

- Nothing is invented. A field the CV does not contain stays empty.
- A person reviews before anything is public.
- A published portfolio is a database read and nothing else.
- Never add an `eslint-disable` comment. Exceptions go in
  `eslint/exceptions.config.mjs` with an id and a reason.
- Never weaken a gate to make it pass.
