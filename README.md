# PortfolioGenerate

Turn a CV into a portfolio website you own, at an address you choose.

Upload a PDF. The platform reads it, shows you what it found, lets you correct
anything it got wrong, and publishes it at `https://<host>/<your-slug>`.

---

## The three commitments

**Nothing is invented.** A field your CV does not contain stays empty. The
extraction schema is nullable everywhere, so the model always has a legal way to
say "not present" and never has to choose between guessing and failing
validation. Anything the extractor could not read confidently is dropped and
flagged, next to the field it concerns.

**You review before anything is public.** Import produces a private draft.
Publishing is a separate, deliberate act, and so is choosing your address.

**A published portfolio is a database read.** One indexed row, cached under a
per-slug tag. It renders when the AI provider, the PDF parser and object storage
are all unavailable — because none of them is on the path.

---

## Stack

|           |                                                                         |
| --------- | ----------------------------------------------------------------------- |
| Framework | Next.js 16 App Router, Server Actions, Turbopack                        |
| Language  | TypeScript 7 (`@typescript/native`)                                     |
| UI        | React 19, Tailwind CSS 4 with semantic tokens                           |
| Data      | PostgreSQL via Prisma 7 with the pg driver adapter                      |
| Auth      | better-auth, email and password, database sessions                      |
| AI        | Vercel AI SDK, OpenAI-compatible — or a deterministic offline extractor |
| Storage   | Any S3-compatible object store, or the local filesystem in development  |
| Tests     | Vitest, Playwright, axe                                                 |

No Redis, no queue, no cron. See
[ADR-0003](./architecture/adrs/0003-postgres-rate-limiting.md).

---

## Getting started

```bash
# 1. A database
docker run --name pg-portfolio-generate -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 -d postgres:17

# 2. Configuration
cp .env.example .env          # then set BETTER_AUTH_SECRET
                              # openssl rand -base64 48

# 3. Install, migrate, seed
npm ci
npm run db:migrate:deploy
npm run db:seed               # publishes one synthetic portfolio

# 4. Run
npm run dev
```

Then open <http://localhost:3000> for the product, and
<http://localhost:3000/amina-rahman> for the seeded portfolio.

The defaults need no API key: `AI_PROVIDER=deterministic` runs a rule-based
extractor that never makes a network call, and `STORAGE_DRIVER=local` writes
private files under `.storage/`.

---

## Commands

```bash
npm run dev              # dev server
npm run lint             # eslint, zero warnings tolerated
npm run typecheck        # TypeScript 7, plus a TypeScript 6 compatibility pass
npm run test             # unit suite (no database needed)
npm run test:coverage    # the same, with thresholds enforced
npm run test:e2e         # Playwright against a production build
npm run test:a11y        # the accessibility subset
npm run build            # typecheck + production build
npm run quality          # lint + typecheck + coverage + build + knip + depcruise
npm run validate         # the full gate, including E2E
```

---

## How it is organised

```
src/
  app/          Routes. Thin: resolve params, call a module surface, render.
  modules/      Features, layered, exported through named surface files.
  packages/     One vendor each, behind a facade.
  shared/       Generic building blocks. Knows nothing about features.
  tests/        Fixtures, unit specs, E2E specs, accessibility specs.
```

Dependency direction is one-way and enforced by a local ESLint plugin:

```
actions → services → repositories | providers → mappers | schemas | policies → types | constants
```

Cross-module imports go through a declared surface, never into another module's
directories.

---

## Documentation

|                                            |                                                               |
| ------------------------------------------ | ------------------------------------------------------------- |
| [AGENTS.md](./AGENTS.md)                   | The canonical instructions for working in this repository     |
| [rules/](./rules/)                         | Why the enforced rules exist                                  |
| [context/](./context/)                     | Vocabulary, the vendor map, what is deliberately out of scope |
| [architecture/adrs/](./architecture/adrs/) | Decisions, with their alternatives                            |
| [docs/](./docs/)                           | Testing, deployment, operations, security, retention, launch  |
| [skills/](./skills/)                       | Procedures for changes that touch several files               |
| [memory/gotchas.md](./memory/gotchas.md)   | Traps in this toolchain, by symptom                           |

---

## Quality gates

`pre-commit` runs lint-staged. `pre-push` runs the full quality gate. CI runs the
same commands plus E2E and accessibility. They are identical on purpose — CI
should never be the first place you learn something is broken.

Coverage: pure logic at 100%, everything else in scope at 95%. Repositories,
server actions, providers and services are covered by the Playwright suite
against a real database rather than by mocks
([ADR-0007](./architecture/adrs/0007-coverage-scope-and-thresholds.md)).

---

## Licence

Not yet chosen.
