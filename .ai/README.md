# .ai/

The index an AI tool should read first when it has no other instruction file.

Everything here points somewhere else on purpose: duplicated context drifts, and
a reader cannot tell which copy is authoritative.

## Start here

1. [`../AGENTS.md`](../AGENTS.md) — the canonical instructions.
2. [`context.md`](./context.md) — the shortest useful description of the system.
3. [`../rules/`](../rules/) — why the enforced rules exist.
4. [`../context/`](../context/) — vocabulary, vendor map, what is out of scope.
5. [`../architecture/adrs/`](../architecture/adrs/) — decisions and their
   alternatives.

## Tool-specific entry points

`CLAUDE.md`, `CODEX.md`, `GEMINI.md`, `KIMI.md`, `GLM.md`, `DEEPSEEK.md`,
`QWEN.md`, `cursor.md`, `.cursorrules`, `.cursor/rules/`. Each is a pointer to
`AGENTS.md` plus the notes specific to that tool.

## Before you write code

- `npm run lint && npm run typecheck:app && npm run test` is the fast loop.
- Never add an `eslint-disable` comment.
- Never lower a threshold or skip a test to get green.
- If a change needs a decision rather than an implementation, say so and stop.
