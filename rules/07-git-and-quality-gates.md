# 07 — Git and the gates

## Commits

Conventional Commits, enforced by commitlint. The subject says what changed; the
body says **why**. A body that restates the diff is worse than no body.

A commit compiles, passes lint and typecheck, and does one thing.

## Hooks

| Hook         | Runs                                                   |
| ------------ | ------------------------------------------------------ |
| `pre-commit` | lint-staged: eslint --fix and prettier on staged files |
| `commit-msg` | commitlint                                             |
| `pre-push`   | `npm run gate:push`                                    |

## CI

Three workflows: quality (lint, typecheck, coverage, build, dead code, circular
dependencies), E2E (production build against a Postgres service container), and
security (audit and dependency review).

CI runs the same commands as the hooks on purpose. CI should never be the first
place you learn something is broken.

## Never

- `--no-verify` on a push to a shared branch.
- An `eslint-disable` comment. Exceptions live in
  `eslint/exceptions.config.mjs` with an `EXC-` id and a note in
  `docs/exceptions/`.
- Lowering a threshold or skipping a test to get green. That is a change to the
  product's guarantees; argue for it in its own commit.
