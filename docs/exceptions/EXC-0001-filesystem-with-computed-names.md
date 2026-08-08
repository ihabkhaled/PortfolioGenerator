# EXC-0001 — Filesystem access with a computed name

**Rule:** `security/detect-non-literal-fs-filename`
**Scope:** `src/modules/storage/providers/local-object-storage.provider.ts`,
`support/*.mts`, `support/alias-resolver.mjs`

## Why the rule fires

These files open paths built at runtime. The rule cannot tell a
crypto-random key from a user-supplied filename.

## Why it does not apply

Storage keys are generated server-side from crypto randomness and validated
against `STORAGE_KEY_PATTERN` before any call reaches the filesystem. A user
never chooses a key, and the original filename is kept in a database column
where it is only ever rendered as text.

The support scripts run at build time in a developer's own checkout, never on a
request. The alias resolver stats candidate module paths that the TypeScript
compiler has already resolved.

## What would make this exception wrong

Any path in these files derived from request input without passing
`isValidStorageKey`. If that ever happens, the exception must go and the rule
must be satisfied.
