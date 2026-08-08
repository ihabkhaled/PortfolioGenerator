# EXC-0005 — The cleartext-URL autofix

**Rules:** `sonarjs/no-clear-text-protocols`, `unicorn/prefer-https`
**Scope:** `src/shared/utils/safe-url.util.ts`, `src/tests/unit/safe-url.test.ts`

## Why the rules fire

Both files name `http://` — the policy in prose, the test in its fixtures.

## Why they do not apply, and why this one matters

`sonarjs/no-clear-text-protocols` has an autofix that rewrites `http://` to
`https://`. In a test whose entire purpose is asserting that cleartext URLs are
_rejected_, that fixer quietly inverts the assertion.

It did exactly that, twice, and the suite stayed green both times. The exception
exists because an autofix that silently turns a security test into its opposite
is worse than the pattern it is trying to prevent.
