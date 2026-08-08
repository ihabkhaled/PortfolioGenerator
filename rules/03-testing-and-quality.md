# 03 — Testing

## What each suite is for

| Suite                          | Runs against                    | Answers                                                   |
| ------------------------------ | ------------------------------- | --------------------------------------------------------- |
| Unit (vitest, jsdom)           | Real modules, real fixtures     | Does this logic hold for the inputs it will actually see? |
| E2E (Playwright)               | Production build, real Postgres | Does the system do what it promises a user?               |
| Accessibility (axe + keyboard) | The same build                  | Can everyone use it?                                      |

## Coverage

- **Pure layers — utils, helpers, mappers, schemas, policies — are held at
  100%.** It is the layer where a missing test is a missing decision, and where
  a test costs a minute. Branches that `noUncheckedIndexedAccess` forces the
  compiler to demand and an invariant makes unreachable are marked with
  `/* v8 ignore next -- reason */`, so the number stays meaningful.
- **Everything else in scope is held at 95%.**
- **Repositories, actions, providers and services are out of scope for unit
  coverage.** They need a session and a database to mean anything. Mocking both
  would raise a number while asserting a system that does not exist; the E2E
  suite runs them for real instead.
- **Constants and variants files are out of scope.** They are declarations.
  Importing one in a test to move a percentage asserts nothing.

See [ADR-0007](../architecture/adrs/0007-coverage-scope-and-thresholds.md).

## What a good test looks like

It asserts something a user or an attacker would notice, and its name says what
that is. Compare:

- `it('returns null')` — describes the implementation.
- `it('drops an unreadable date rather than inventing one')` — describes the
  promise.

Fixtures are synthetic and shared between the unit suite, the E2E suite and the
development seed, so "works locally" and "passes CI" describe the same document.
A real CV in a repository is a privacy incident waiting for someone to clone it.

## Determinism

The AI provider defaults to `deterministic`, which never makes a network call.
CI pins it. A suite that can reach a paid model is a suite that can fail because
someone else's service is having an afternoon — and a bill nobody approved.
