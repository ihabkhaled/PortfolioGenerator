# EXC-0003 — The logger owns console output

**Rule:** `no-console`
**Scope:** `src/packages/logger/**`

## Why the rule fires

The logger calls `console`.

## Why it does not apply

Something has to. This package is the single owner of console output, which is
what makes the rule enforceable everywhere else — and what makes replacing the
sink a one-directory change.
