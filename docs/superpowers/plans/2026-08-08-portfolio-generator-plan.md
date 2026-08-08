# Implementation Plan — PortfolioGenerate

Spec: [2026-08-08-portfolio-generator-design.md](../specs/2026-08-08-portfolio-generator-design.md)

Each phase ends green on its own gate and is committed and pushed before the next begins.
Commits are conventional and scoped to one concern.

## Phase 0 — Toolchain and governance

- `package.json` on latest-everything (Next 16.3.0, TypeScript 7.0.2, React 19.2.8, Tailwind 4.3.3,
  Zod 4.4.3, Prisma 7.9.1, better-auth, AI SDK 7, Vitest 4, Playwright 1.62), Node 24.18.0.
- tsconfig set: `tsconfig.json` (strict + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`),
  `.app`, `.test`, `.node`, `.eslint`, `.build`.
- ESLint flat config split under `eslint/`, local `portfolio-architecture` plugin, package-boundary
  map, `--max-warnings=0`, severity verifier.
- Prettier, editorconfig, knip, dependency-cruiser, npm-check-updates, commitlint.
- Husky `pre-commit` / `commit-msg` / `pre-push`; lint-staged.
- GitHub: `ci.yml`, `e2e.yml`, `security.yml`, `dependabot.yml`, issue and PR templates.
- Governance layer: `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `GEMINI.md`, `KIMI.md`, `GLM.md`,
  `DEEPSEEK.md`, `QWEN.md`, `cursor.md`, `.cursorrules`, `.cursor/rules/*.mdc`, `.ai/BOOTSTRAP.md`,
  `.ai/context-manifest.json`, `rules/`, `skills/`, `agents/`, `context/`, `memory/`,
  `architecture/adrs/`, `docs/`.

Gate: `npm run lint && npm run typecheck && npm run build` on an empty app shell.

## Phase 1 — Foundation

- `src/packages/*` vendor wrappers: `env` (+ `env/server`), `zod`, `prisma`, `auth`, `i18n`,
  `ui-primitives`, `icons`, `link`, `image`, `navigation`, `forms`, `toast`, `logger`, `browser`.
- Design tokens in `src/app/styles.css`, ported from the reference palette; `SiteShell`,
  `PageHeader`, `Section`, `EmptyState`, `ErrorState`, `FormField`, `SkipLink`, `VisuallyHidden`.
- `portfolio-document` module: Zod schema, section union, defaults factory, migration entry point,
  page/section resolver, JSON Schema generator + committed artifact.
- `publishing` module: slug normalize/validate, reserved-word denylist derived from `ROUTE_PATHS`.
- Prisma schema + first migration; `PortfolioRepository` with owner-scoped methods only.
- better-auth wiring, sign-up/sign-in/sign-out, protected dashboard shell, safe redirects.
- Public route `/[portfolioSlug]/[[...pageSlug]]` reading a seeded published document; 404 for
  unknown/unpublished.
- `npm run db:seed` development command that publishes a fixture portfolio.

Tests: slug policy, document schema, migration, page resolver, ownership guards, published-only
read, 404 unpublished, render smoke.

## Phase 2 — Resume upload and AI ingestion

- `storage` module: `ObjectStorage` interface, `LocalObjectStorage`, `S3ObjectStorage`.
- `rate-limit` module: `RateLimiter` interface, memory + Postgres adapters, quota policy.
- `resume-ingestion`: signature/size/page validation, SHA-256, state machine, `unpdf` extractor,
  text normalizer, dedupe reuse, upload server action + status polling.
- `ai` module: `PortfolioAiProvider`, `FakePortfolioAiProvider` (deterministic), `AiSdkProvider`
  with configurable primary/fallback models, strict structured output, prompt envelope,
  deterministic repair, targeted fragment repair, capped retries, `ai_runs` instrumentation.
- Extraction → `PortfolioDocument` mapper with warnings.

Tests: signature rejection, oversize rejection, encrypted PDF, state transitions, dedupe, text
normalization, provider success/invalid-JSON/schema-failure/fallback, repair caps, quota denial,
injection fixture treated as data, cross-tenant upload access denied.

## Phase 3 — Renderer and SEO

- `reference-classic-v1` template: shell, nav from visible pages, hero, about, experience,
  projects, skills, education, certifications, languages, contact, custom blocks.
- Section registry, empty-data behavior, theme mode attribute, RTL-safe logical spacing.
- `seo`: per-page metadata, canonical, robots, OG image route from validated fields only,
  `Person` structured data, sitemap over published portfolios and visible pages.
- Cache tags per portfolio + explicit revalidation hook.

Tests: fixture matrix (full, minimal, no photo, no projects, long content, custom section,
dynamic subpage), metadata assertions, sitemap excludes drafts, bundle has no authoring imports.

## Phase 4 — Editor, preview, publishing

- Editor shell with section navigation and live preview; identity, contact, links, experience,
  projects, skills, education, certifications, languages, awards forms.
- Page CRUD and section add/remove/reorder/visibility with keyboard-accessible reordering.
- Custom safe blocks editor.
- Draft save server actions with `expectedVersion`; conflict UX.
- Slug editor with debounced availability; preview route (`noindex`, owner-only).
- Publish / republish / unpublish transactions with cache invalidation and audit events.

Tests: draft conflict, publish snapshot isolation, republish updates public, unpublish 404,
slug race, reserved slug rejection, IDOR on every editor action.

## Phase 5 — Hardening and launch

- CSP nonce proxy, security headers, URL sanitization at publish, deletion lifecycle
  (CV, portfolio, account), retention documentation.
- Budget breaker and global AI caps; `admin-health` probe and AI-run view.
- Full E2E golden path plus adversarial suite; accessibility suite; visual suite.
- `.env.example`, deployment profiles, migration/backup notes, `docs/launch-readiness.md`.
- Final audit pass against `21-FINAL-AUDIT-PROMPT.md`, then the launch rehearsal from
  `22-E2E-LAUNCH-PROMPT.md`.

Gate: `npm run validate` green, definition-of-done checklist complete.
