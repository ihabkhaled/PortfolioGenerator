# Testing

## Running things

```bash
npm run test              # unit, jsdom, no database needed
npm run test:watch        # the same, watching
npm run test:coverage     # the same, with thresholds enforced
npm run test:e2e          # Playwright: production build + real Postgres
npm run test:a11y         # the accessibility subset only
npm run test:e2e:ui       # Playwright's UI mode, for debugging a spec
```

The unit suite needs nothing. The E2E suite needs a PostgreSQL database
reachable at `DATABASE_URL` and a Chromium install
(`npm run test:e2e:install`).

```bash
docker run --name pg-portfolio-generate -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 -d postgres:17
npm run db:migrate:deploy
```

Port 5433 rather than 5432 so a developer's other project's database keeps
working.

## The split

**Unit (vitest, jsdom).** Pure logic, and components rendered against real
fixtures with Testing Library. Real modules wherever possible: only
`server-only` (a build-time marker with no test meaning) and the environment
are stubbed, so a developer's local `.env` cannot change an assertion.

**E2E (Playwright).** A production build on port 3100, a real database, and the
deterministic AI provider pinned by the config. One worker, because the suite
asserts on publish and unpublish transitions of globally unique slugs.

**Accessibility (Playwright + axe).** WCAG 2.2 AA across every reachable page,
both themes, and a 320px viewport, plus a keyboard walkthrough for what axe
cannot check.

## Coverage

| Scope                                                | Threshold                     |
| ---------------------------------------------------- | ----------------------------- |
| `utils`, `helpers`, `mappers`, `schemas`, `policies` | 100%                          |
| Everything else in scope                             | 95%                           |
| `repositories`, `actions`, `providers`, `services`   | Out of scope — covered by E2E |
| `constants`, `variants`, surfaces, vendor facades    | Out of scope — declarations   |

The reasoning is in [ADR-0007](../architecture/adrs/0007-coverage-scope-and-thresholds.md).

A handful of branches in the pure layers are unreachable: `noUncheckedIndexedAccess`
forces the compiler to demand a check that an invariant three lines up makes
impossible. Each is marked `/* v8 ignore next -- reason */` at the site. If you
find yourself adding one, first make sure the branch really is unreachable — the
marker is a claim, and the next reader will believe it.

## Fixtures

`src/tests/fixtures/portfolio-document.fixtures.ts` holds three documents: full,
nearly empty, and long/unicode/RTL. The unit suite, the E2E suite and the
development seed all use them, so "works on my machine" and "passes CI" describe
the same document.

Everything is invented. No real CV belongs in a repository, and the launch
checklist asserts none is present.

The E2E suite builds its PDFs in memory (`src/tests/e2e/support/pdf.fixture.ts`)
for the same reason, with the added benefit that the _content_ of the test is
visible in the diff rather than hidden in a binary.

## Writing a test here

Name it after the promise, not the mechanism. `it('returns null')` describes an
implementation; `it('drops an unreadable date rather than inventing one')`
describes something a user would notice if it broke.

Assert on roles and accessible names rather than on class names or test ids.
A test that finds a button by its accessible name is also a test that the button
has one.
