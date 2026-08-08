# Design — PortfolioGenerate, a multi-tenant CV-to-portfolio platform

Status: approved for implementation
Date: 2026-08-08
Source pack: `portfolio-generator-prompt-pack` (49 files)
Design reference: `https://github.com/ihabkhaled/Portfolio` (inspiration only, never a tenant store)

## 1. Product

A signed-in person uploads a PDF CV, an AI pipeline turns it into structured data, they review and
correct every fact, compose pages and sections, claim a slug, and publish. The result is a public
URL of the form `/{slug}` served from a published snapshot.

Golden path: `sign up → create portfolio → upload CV → extract → review → preview → claim slug →
publish → share`.

The product is a **portfolio publishing platform**, not a static-site generator and not a code
generator. There is exactly one repository, one deployment, and one renderer for every tenant.

## 2. Non-negotiable architecture

1. One multi-tenant app. No repo, fork, deployment, directory, or generated source per user.
2. `/{slug}` and `/{slug}/{pageSlug}` are dynamic routes backed by `published_document` JSONB.
3. Editing mutates `draft_document` only; publishing snapshots draft → published atomically.
4. AI belongs to the authoring pipeline. A published portfolio renders with the AI key removed.
5. Raw CVs are private objects with random keys, never publicly addressable.
6. Every dashboard repository call is owner-scoped: `getOwnedPortfolio(ownerId, id)`, never
   "load by id, check ownership later".
7. `PortfolioDocument` runtime validation (Zod) is canonical; JSON Schema is generated from it.
8. No raw HTML, no `dangerouslySetInnerHTML`, no user CSS/JS. Custom content is a bounded block union.
9. Volatile third-party APIs sit behind narrow adapters (`PortfolioAiProvider`, `ObjectStorage`,
   `ResumeTextExtractor`, `RateLimiter`, `AuditSink`, `PortfolioRepository`).

### Deviation from the pack (recorded as ADR-0002)

The pack suggests the public prefix `/portfolios/<slug>`. We serve portfolios at the **root**
`/{slug}` instead, because a personal portfolio URL is the product's shareable artifact and the
extra segment adds nothing. The safety property the prefix was buying — no collision with platform
routes — is preserved by a *reserved-slug denylist derived from the actual route table*, which is
stronger than a prefix (a prefix protects nothing if a new route is added under it). Route order in
Next.js resolves static segments before the dynamic `[portfolioSlug]` catch-all, and the denylist
plus a unit test over `ROUTE_PATHS` keeps the two in sync.

## 3. Stack

| Concern         | Choice                                                       |
| --------------- | ------------------------------------------------------------ |
| Framework       | Next.js 16.3.0 App Router, Turbopack, typedRoutes            |
| Runtime         | React 19.2.8, Node 24.18.0                                    |
| Language        | TypeScript 7.0.2 (`@typescript/native` tsgo) + TS6 for tooling|
| Styling         | Tailwind CSS 4.3.3, CSS-first semantic tokens                 |
| Validation      | Zod 4.4.3 behind `@/packages/zod`                             |
| Database        | PostgreSQL + Prisma 7.9.1                                     |
| Auth            | better-auth 1.6.26 (email + password, DB sessions)            |
| AI              | AI SDK 7 (`ai`, `@ai-sdk/openai`) behind `PortfolioAiProvider`|
| PDF text        | `unpdf` behind `ResumeTextExtractor`                          |
| Object storage  | `ObjectStorage` adapter: local FS (dev/test), S3-compatible   |
| Rate limit      | `RateLimiter` adapter: in-memory (dev/test), Postgres (prod)  |
| Copy            | next-intl, single `en` catalog, `localePrefix: 'never'`       |
| Unit/integration| Vitest 4 + Testing Library + MSW                              |
| E2E/a11y/visual | Playwright 1.62 + axe                                         |
| Lint            | ESLint flat config + local `portfolio-architecture` plugin    |

Redis is deliberately absent. Rate limiting and quota counters are Postgres rows with an index on
`(bucket, window_start)`; the pack explicitly warns against adding Redis by reflex.

## 4. Module map

```
src/modules/
  auth/                 session + owner resolution, sign-in/up/out surfaces
  portfolios/           PortfolioRepository, ownership guards, CRUD use cases
  portfolio-document/    canonical Zod schema, migrations, page/section resolver
  portfolio-renderer/    reference-classic-v1 template + section registry
  portfolio-editor/      dashboard forms, collection CRUD, page/section builder
  resume-ingestion/      upload validation, state machine, text extraction
  ai/                    PortfolioAiProvider interface + fake/real adapters
  storage/               ObjectStorage interface + local/S3 adapters
  publishing/            slug policy, publish/unpublish transaction, cache tags
  seo/                   metadata, sitemap, OG image, structured data
  rate-limit/            RateLimiter interface + adapters, quota policy
  audit/                 bounded structured events, AuditSink
  admin-health/          health probe, AI-run visibility query
```

Layering per module: `containers → hooks → services → repositories/providers → mappers/schemas/
types/constants`. Services are React-free. Components are TSX-only.

## 5. Data model

```
users, sessions, accounts, verifications   (better-auth owned)

portfolios
  id, owner_id, slug, status, template_id,
  draft_document jsonb, draft_version int,
  published_document jsonb?, published_version int?, published_at?,
  created_at, updated_at, deleted_at?
  unique(slug)   index(owner_id, deleted_at)

resume_uploads
  id, owner_id, portfolio_id, storage_key, original_filename, mime_type,
  size_bytes, sha256, status, page_count?, extracted_text_storage_key?,
  warnings jsonb, error_code?, created_at, updated_at, deleted_at?
  index(owner_id, portfolio_id)   index(owner_id, sha256)

ai_runs
  id, owner_id, portfolio_id?, resume_upload_id?, operation, provider, model,
  status, input_units?, output_units?, estimated_cost_minor?, currency?,
  latency_ms?, retry_count, fallback_used, error_code?, created_at

audit_events
  id, owner_id?, portfolio_id?, event_type, metadata jsonb, created_at
  index(portfolio_id, created_at)

rate_limit_counters
  id, bucket, window_start, count      unique(bucket, window_start)
```

Draft/published invariant: public reads touch `published_document` only. Publishing is one
transaction: validate document → validate slug → normalize URLs/text → copy → bump
`published_version` → stamp `published_at` → status `published` → revalidate cache tags →
append audit event.

Optimistic concurrency: every draft mutation carries `expectedVersion`. A mismatch returns a
conflict the UI reconciles; it never silently overwrites.

## 6. PortfolioDocument

One Zod schema (`schemaVersion: 1`) covering identity, contact (per-field visibility), links,
experience, projects, skills groups, education, certifications, languages, awards, pages, theme,
seo, source. Pages carry ordered sections; sections are a discriminated union over
`hero | about | experience | projects | skills | education | certifications | languages | contact |
custom`. Built-in sections reference canonical collections rather than duplicating content; a
`custom` section holds bounded blocks (`paragraph | bullet-list | stat-list | links`).

`migratePortfolioDocument(input: unknown): PortfolioDocument` is the only entry point for reading
stored JSON. Version 1 documents pass through; future versions register a step. Published documents
written under an older version must keep rendering — the renderer only ever sees a migrated,
validated document.

Page rules: exactly one home page with empty slug; non-home slugs unique within the portfolio and
matching `^[a-z0-9-]+$`; bounded page/section/block counts; no path traversal.

## 7. CV ingestion pipeline

State machine:
`UPLOADED → VALIDATED → TEXT_EXTRACTED → AI_STRUCTURING → NEEDS_REVIEW → READY`
plus `FAILED_VALIDATION | FAILED_TEXT_EXTRACTION | FAILED_AI`. Persisted so a refresh recovers.

1. Quota and rate limit checked **before** any byte is stored.
2. Signature check: `%PDF-` magic bytes, not the browser MIME string. Encrypted PDFs rejected.
3. Size and page caps from config; random storage key; private bucket.
4. SHA-256 over bytes; same-owner exact duplicates reuse the previous extraction.
5. Local text extraction (`unpdf`) first. Normalize whitespace, drop repeated page furniture,
   preserve section cues, cap input characters.
6. Scanned-document heuristic (chars per page below a threshold) → OCR only if enabled; otherwise
   a clear "this looks scanned" message plus the manual-entry path.
7. One primary structured-output call. Validate against the extraction schema.
8. Deterministic repairs first (date normalization, URL validation, dedupe, trimming). Only an
   still-invalid *fragment* is repaired by a targeted second call. The fallback model runs only if
   the document is still unusable. Retries are capped.
9. Map to `PortfolioDocument`, persist as **draft**, surface warnings. Never auto-publish.

Prompt injection: the CV is untrusted data delivered inside a `<resume_text>` envelope, never
concatenated into the system instruction. The model has no tools and no network. An E2E fixture
contains an injection sentence and asserts extraction is unchanged.

## 8. Public renderer

`PortfolioTemplate({ document, page })` is generic. No public component may import tenant constants.
A typed `SECTION_RENDERERS` registry maps section type → renderer; unknown types are skipped
silently rather than crashing a published page.

Template `reference-classic-v1` adapts the reference site's visual system: layered neutral
surfaces, hairline borders, one confident accent, a monospace-eyebrow section rhythm, the
label/value "manifest" panel motif, editorial display type, and the faint measured grid behind the
hero. Dark mode is attribute-driven from `theme.mode`.

Empty-data behavior is a first-class requirement: no photo, no projects, no education, one role,
very long names, unicode and RTL content inside fields must all render without empty headings.

Public request budget: one indexed DB read (cached by tag), server render, zero AI, zero storage
calls, zero session lookup.

## 9. Editor

Two-pane on desktop (forms left, live draft preview right), tabbed on mobile. Explicit Save with a
dirty indicator — chosen over autosave because optimistic-concurrency conflicts are far easier to
explain on an explicit action. Every collection supports create/update/delete/reorder with a
keyboard-accessible move-up/move-down control alongside drag handles. Extraction warnings appear
inline next to the field they concern, never as raw model output.

Publishing UX: debounced slug availability check (advisory) plus an authoritative unique-constraint
transaction (decisive). Preview is owner-authenticated, `noindex`, and never exposes the raw CV.

## 10. Security

Threats explicitly tested: cross-tenant IDOR, XSS from CV/model/user text, prompt injection,
malicious and oversized PDFs, path traversal, object-key guessing, SSRF via user URLs, slug races,
stale draft writes, unpublished-slug probing, cache leakage across tenants, secret exposure.

Controls: better-auth sessions with server-side validation on every protected operation; owner-
scoped repositories; nonce-based CSP from `src/proxy.ts` plus static security headers; URL
allowlist (`https:` and `mailto:` only) applied at publish time; no server-side fetch of
user-supplied URLs; rate limits before expensive work; per-user daily AI quotas and a global budget
breaker; CV/portfolio/account deletion paths that remove private objects.

## 11. Quality gates

`npm run lint` (zero warnings) · `typecheck` (TS7) · `typecheck:compat` (TS6) · `test:coverage`
(95% global, 100% for helpers/mappers/schemas/policies) · `build` · `quality:dead-code` ·
`quality:circular` · `security:audit`. Aggregates: `quality`, `gate:push`, `validate`.

Enforced by `.husky/pre-commit` (lint-staged), `.husky/commit-msg` (conventional commits),
`.husky/pre-push` (`gate:push`), and three GitHub Actions workflows (CI, E2E, Security).

A local `portfolio-architecture` ESLint plugin turns the architecture into machine-checked rules,
including two project-specific ones: `no-authoring-imports-in-public-render` (the public renderer
may never reach the AI, ingestion, editor, or PDF layers) and `no-unscoped-portfolio-access`
(dashboard code may not call unscoped repository finders).

## 12. Explicitly deferred

Billing, custom domains, template marketplace, LinkedIn/social scraping, automatic web research,
team workspaces, public API, arbitrary CSS/HTML, many themes, automatic translation of CV content,
and a portfolio-wide AI chat assistant. Extension points are designed for templates, themes,
custom domains, and export; none are implemented.
