# ADR-0007 — Coverage scope reflects what a unit test can honestly verify

- **Status:** Accepted
- **Date:** 2026-08-09

## Context

The initial configuration demanded 95% line coverage over every file in
`src/modules`, `src/shared` and `src/packages`, including repositories,
server actions, network providers and framework facades.

Meeting that number would have required mocking Prisma, the session, the object
store and the framework — producing a high percentage attached to assertions
about a system that does not exist.

## Decision

Coverage scope is narrowed to what a unit test verifies honestly, and the
thresholds are raised where it does:

- Pure layers (`utils`, `helpers`, `mappers`, `schemas`, `policies`) at
  **100%**, with unreachable defensive branches marked
  `/* v8 ignore next -- reason */` so the number keeps meaning something.
- Everything else in scope at **95%**.
- Out of scope: `repositories`, `actions`, `providers`, `services`, surface
  files, constants and variants files, and vendor facades.

The excluded layers are covered by the Playwright suite against a production
build, a real Postgres and a real browser.

## Consequences

- The number is trustworthy: a drop means a real gap, not a missing mock.
- Authorization, cache invalidation, redirects and the import pipeline are
  verified where they actually live.
- The E2E suite is now load-bearing. It must stay fast enough to run on every
  push, and a skipped E2E test is a hole in the gate, not a minor annoyance.
- Someone reading the coverage report will see services at 0%. This ADR is the
  answer to "why", and `vitest.config.mts` says it inline too.

## Alternatives considered

**Keep 95% everywhere and mock the boundaries.** Rejected: the mocks encode
the same assumptions as the code, so the tests pass exactly when the code is
wrong in the way the author expected.

**Lower the global threshold to whatever the suite happens to achieve.**
Rejected: a threshold that tracks reality is not a gate.
