# AGENTS.md

The canonical instructions for anyone — human or model — writing code in this
repository. Every other agent file (`CLAUDE.md`, `CODEX.md`, `GEMINI.md`,
`KIMI.md`, `GLM.md`, `DEEPSEEK.md`, `QWEN.md`, `cursor.md`, `.cursorrules`)
points here. Change this file; the others follow.

---

## 1. What this product is

PortfolioGenerate turns a person's CV into a portfolio website they own, at a
public address they choose. One account, many portfolios, one template.

Three sentences carry most of the design:

1. **Nothing is invented.** A field the CV does not contain stays empty. The
   extractor reports; it does not fill gaps. A plausible-sounding fabrication on
   someone's professional page is the worst failure this product has.
2. **A person reviews before anything is public.** Import produces a draft.
   Publishing is a separate, deliberate act.
3. **A published portfolio is a database read.** It renders when the AI
   provider, the PDF parser and object storage are all down.

If a change would weaken any of those, it needs an ADR, not a commit message.

---

## 2. Non-negotiables

These are enforced by lint, tests or CI. Working around them is not a shortcut,
it is a defect.

| Rule                                                                               | Enforced by                                                        |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Every dashboard repository call takes an `ownerId` in the WHERE clause             | `portfolio-architecture/no-unscoped-repository-access`             |
| Tenant-free reads carry an `Unscoped` suffix and live only in the public read path | same rule                                                          |
| Server actions resolve the owner before doing anything                             | review + E2E                                                       |
| Stored JSON is parsed through `portfolioDocumentSchema`, never cast                | `packages/zod` returns a result; nothing else parses               |
| One vendor, one wrapper directory                                                  | `portfolio-architecture-boundaries/no-raw-package-imports`         |
| The public render path imports no authoring code                                   | `portfolio-architecture/no-authoring-imports-in-public-render`     |
| Layer direction: actions → services → repositories/providers → pure logic          | `portfolio-architecture/no-restricted-layer-imports`               |
| No `eslint-disable` comments anywhere                                              | policy; exceptions live in `eslint/exceptions.config.mjs`          |
| No user-facing string outside the message catalog                                  | `portfolio-architecture/no-raw-i18n-text`                          |
| No raw `className` outside the design system                                       | `portfolio-architecture/no-inline-classname-outside-design-system` |
| `process.env` only inside `packages/env`                                           | `portfolio-architecture/no-process-env-outside-config`             |
| Pure logic at 100% coverage; everything unit-tested at 95%                         | `vitest.config.mts` thresholds                                     |

---

## 3. Layout

```
src/
  app/          Routes only. Thin: resolve params, call a module surface, render.
  modules/      Features. Each owns its layers and exports through named surfaces.
  packages/     One vendor each, behind a facade. Sits below every layer.
  shared/       Generic building blocks. Knows nothing about features or routes.
  tests/        Fixtures, unit specs, E2E specs, accessibility specs.
```

A module looks like this, and every directory name is load-bearing — the lint
rules key on them:

```
modules/<name>/
  actions/        'use server'. The authorization boundary.
  components/     Props in, TSX out. No state, no data access, no logic.
  constants/      Values. No behaviour.
  containers/     'use client'. State and event handling; calls actions.
  helpers/        Pure functions. Every one exported so tests can reach it.
  hooks/          'use client'. State orchestration.
  mappers/        Untrusted shape → owned shape.
  policies/       Decisions expressed as pure functions.
  providers/      Infrastructure adapters (network, filesystem, SDK).
  repositories/   Database access. Owner-scoped.
  schemas/        Zod schemas.
  services/       Use cases. React-free.
  types/          Interfaces and type aliases. No values.
  index.ts        Public surface: pure logic and types.
  server.ts       Server-only surface: services and repositories.
  <name>-ui.ts    UI surface, when the module has one.
```

Cross-module imports go through a declared surface — `index`, `server`,
`client`, `dashboard`, `ingestion-ui`, `editor-ui`, `account-ui`. Reaching into
another module's directories is an error, because the module decides what is
public.

---

## 4. How to work here

**Read before writing.** The neighbouring file already answers most style
questions. Match its comment density, its naming, its idiom.

**Comments explain decisions, not mechanics.** `// increment i` is noise.
"Objects first, row second — the cascade takes the upload rows with the user,
and with them the only record of which keys were theirs" is the reason someone
will need in six months. Write the second kind, or nothing.

**Small, complete commits.** A commit compiles, passes lint and typecheck, and
does one thing. The message says _why_.

**When a rule is in the way, the rule might be right.** The lint rules here
encode decisions, not taste. If one blocks you, first check whether it is
telling you the design is wrong. If it genuinely does not apply, add a
documented, file-scoped entry to `eslint/exceptions.config.mjs` with an `EXC-`
id and a matching note in `docs/exceptions/`. Never an inline disable.

**Do not weaken a gate to make it pass.** Lowering a coverage threshold,
narrowing a lint rule, or skipping a test to get green is a change to the
product's guarantees and needs to be argued for, in the commit message, on its
own.

**Say it short.** Default to 1–5 lines. Name the exact file, error, count or
blocker. A blocker starts with `Blocked:`. `Done.` carries its proof. Never
claim background work that is not running. The rule is
[`rules/08-communication-style.md`](./rules/08-communication-style.md); the
templates are [`skills/communicate-briefly.md`](./skills/communicate-briefly.md).

---

## 5. Commands

```bash
npm run dev              # Next dev server on :3000
npm run lint             # eslint, --max-warnings=0, plus a severity check
npm run typecheck        # TS 7 (app, test, node) + TS 6 compatibility pass
npm run test             # vitest, jsdom
npm run test:coverage    # the same, with thresholds enforced
npm run test:e2e         # Playwright: production build + real Postgres
npm run test:a11y        # the accessibility subset
npm run build            # typecheck:app + next build
npm run quality          # lint + typecheck + coverage + build + knip + depcruise
npm run gate:push        # format check + quality + npm audit
npm run validate         # gate:push + E2E — the full gate
```

Two TypeScript compilers are installed on purpose. `@typescript/native`
(TypeScript 7) is the gate that matters for application code. `typescript`
(TypeScript 6) exists because typescript-eslint and Next's build-time check
cannot yet run on 7, and `typecheck:compat` keeps the two honest.

---

## 6. Testing

The suite is split by what each kind of test is actually good at.

- **Unit (vitest, jsdom).** Pure logic and components rendered against real
  fixtures. Pure layers are held at 100%; the rest at 95%. Repositories,
  actions, providers and services are _excluded_ from unit coverage — mocking a
  database to raise a number produces assertions about a system that does not
  exist.
- **E2E (Playwright).** A production build, a real Postgres, the deterministic
  AI provider. This is where authorization, cache invalidation, redirects and
  the import pipeline are actually verified.
- **Accessibility (Playwright + axe).** WCAG 2.2 AA on every reachable page,
  plus a keyboard walkthrough for the things axe cannot check.

Tests assert behaviour a user or an attacker would notice. A test that asserts
an implementation detail is a maintenance cost with no benefit.

---

## 7. The gates

`pre-commit` runs lint-staged. `pre-push` runs `gate:push`. CI runs the same
commands plus the E2E and accessibility suites. They are identical on purpose:
CI should never be the first place you learn something is broken.

Do not skip hooks. If a hook is wrong, fix the hook.

---

## 8. Where to look

| Question                                 | File                                       |
| ---------------------------------------- | ------------------------------------------ |
| Why is the code organised this way?      | `rules/01-next-app-router-architecture.md` |
| Which package owns which vendor?         | `context/package-boundaries.md`            |
| What does a `PortfolioDocument` contain? | `src/modules/portfolio-document/schemas/`  |
| Why was X decided?                       | `architecture/adrs/`                       |
| What is deliberately not built?          | `context/product-decisions.md`             |
| How do I deploy this?                    | `docs/deployment.md`                       |
| What happens to a user's data?           | `docs/retention-and-privacy.md`            |
| What must be true before launch?         | `docs/launch-readiness.md`                 |
