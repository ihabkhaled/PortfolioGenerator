# PortfolioGenerate Product Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the six approved releases that turn secure CV and asset uploads into reviewed,
localized, discoverable, reference-quality public portfolios.

**Architecture:** Extend the current module-first application without replacing its draft/published
snapshot model. New infrastructure is isolated behind vendor facades and module server surfaces;
public rendering reads only validated published database snapshots.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 7/6, Prisma/PostgreSQL, Zod, better-auth,
AI SDK with OpenAI-compatible/Gemini providers, S3-compatible storage, ClamAV, Vitest, Playwright.

## 2026-08-09 completion audit and revised remaining work

The original checkboxes below record the first implementation pass; they are not evidence of
launch completion. A source-by-source audit after that pass places the whole expansion at roughly
76%. The following backlog is authoritative and must be completed before the final gate, commits,
or deployment handoff.

### Release 1 remainder — secure file platform

- [ ] Make production scanning fail closed at configuration time: production must not boot or
      accept uploads with `CLAMAV_ENABLED=false`; local/test opt-out remains explicit.
- [ ] Add real scanner readiness and smoke evidence to launch checks, including signature age.
- [ ] Convert an imported CV into an owner-reviewable attachment without creating a second unsafe
      upload path; it becomes downloadable only after explicit visibility and publish decisions.
- [ ] Authorize media against the exact visible public page/section that exposes it. Add a
      grant-scoped route for files used only by private pages so direct object URLs cannot bypass the
      page password.
- [ ] Add durable retry/tombstone handling for object deletions that fail after a row is soft
      deleted.
- [ ] Keep scanned CVs rejected until a real bounded OCR provider exists; never let an `OCR_ENABLED`
      flag send empty text to AI.

### Release 2 remainder — complete factual AI authoring

- [ ] Extend evidence-bound extraction and mapping for publications, volunteering, interests, and
      other canonical factual collections that can occur in a CV. Testimonials and media remain empty
      unless owner input or direct document evidence supports them.
- [ ] Generate page sections from every populated collection: soft skills, courses, awards,
      languages, socials, gallery, attachments, and the existing core sections. Empty collections stay
      omitted and the twelve-page bound remains enforced.
- [ ] Add Mastodon and Bluesky to the bounded social platform set while retaining existing extras.
- [ ] Add full/sparse/multilingual/prompt-injection fixtures and field-level provenance or review
      warnings so no invented fact can silently enter a draft.

### Release 3 remainder — complete account and private authoring

- [ ] Finish and verify profile, password, email verification, session revoke, persisted locale,
      persisted theme, default country, logout, reset, deletion, and multi-portfolio UI workflows.
- [ ] Synchronize stored preferences with runtime precedence: URL locale > saved locale > English;
      explicit theme choice > saved theme > operating-system preference.
- [ ] Make private-page grants, redirects, cookie paths, metadata, and media access locale-aware.
- [ ] Emit and verify `X-Robots-Tag: noindex, nofollow` plus `Cache-Control: private, no-store` for
      every private challenge/content response.
- [ ] Cover stale version, IDOR, brute-force limiting, localized private pages, direct-media
      leakage, collection/page CRUD, and reorder behavior in E2E.

### Release 4 remainder — complete localization, theme, mobile, and PWA

- [ ] Create complete key-shape and interpolation-parity catalogs for all thirteen locales:
      English, Arabic, French, German, Italian, Chinese, Japanese, Thai, Portuguese, Spanish, Hindi,
      Persian, and Russian. Supported locales must not silently fall back to English.
- [ ] Add catalog parity tooling/tests and prove UTF-8 source integrity.
- [ ] Document and validate explicit Gemini-compatible translation configuration, including a
      translation-specific model when configured.
- [ ] Add a structured translated-draft correction workflow and mark translations stale whenever
      their source English draft changes; review and publish remain separate actions.
- [ ] Implement a production PWA: manifest, 192/512 maskable icons, Apple icon, conservative service
      worker, offline page, registration/update flow, install UI, safe-area/standalone styling, and CSP
      compatibility. Never cache dashboard, private pages, API responses, CVs, or authenticated data.
- [ ] Verify 320/360/375/390/768 widths, landscape, long translated strings, Arabic/Persian RTL,
      keyboard controls, theme contrast, reduced motion, and safe-area overlays across public,
      marketing, auth, private challenge, editor, import, and settings surfaces.

### Release 5 remainder — dense localized platform content

- [ ] Expand the country/dial-code catalog to complete ISO 3166 country and territory coverage and
      safely split evidence-backed international phone numbers without guessing.
- [ ] Densify all sixteen topic pages plus the landing page with catalog-driven use cases, trust
      boundaries, FAQs, resources, comparisons, and internal links; every launch locale gets authored
      copy rather than placeholders.
- [ ] Add platform Open Graph/Twitter preview metadata and images plus RSS alternate discovery.
- [ ] Keep secure robots exclusions for auth/dashboard/API/private surfaces and document why
      literal allow-all would leak or waste crawl budget.

### Release 6 remainder — proof and delivery

- [ ] Complete the missing unit, E2E, accessibility, security, mobile, PWA, scanner, and response
      header cases listed above.
- [ ] Run the full `npm run validate` gate once on the final stable worktree and record exact output.
- [ ] Run production-mode Lighthouse/PWA/mobile profiles and fix reproducible failures; scores are
      reported on Lighthouse's 0–100 scale, not as an impossible “10+/10”.
- [ ] Only after all gates pass, split the verified tree into five or six coherent commits using
      `--no-verify`, push each with `--no-verify`, and report external-only credentials/deployment work.

## Global Constraints

- Do not invent content absent from the CV or owner input.
- Never publish automatically after extraction, editing, upload, or translation.
- Every dashboard repository call includes `ownerId`; tenant-free public reads use `Unscoped` names.
- Stored documents are parsed by `portfolioDocumentSchema`; never cast stored JSON.
- Public rendering imports no authoring, AI, parser, scanner, or storage implementation.
- Production file scanning is fail-closed.
- No raw HTML, arbitrary CSS/JavaScript, plaintext share passwords, or public raw object keys.
- All user-visible copy comes from message catalogs.
- All UI classes live in the design system or variant/constants files.
- Work test-first and preserve the repository coverage thresholds.
- Do not commit or push during this execution.

---

## File map

- `prisma/schema.prisma`, `prisma/migrations/*`: asset and translation persistence.
- `src/modules/assets/*`: owner-scoped upload, metadata, serving, deletion, and attachment policies.
- `src/modules/file-security/*`: purpose-specific inspection and ClamAV orchestration.
- `src/modules/ai/*`: complete extraction and translation adapters/services.
- `src/modules/portfolio-document/*`: schema/migration for asset references and localized snapshots.
- `src/modules/portfolio-editor/*`: complete collection/page/asset authoring.
- `src/modules/auth/*`, `src/modules/account/*`: verification, reset, profile, password, sessions.
- `src/modules/localization/*`, `src/packages/i18n/*`, `src/proxy.ts`: locale parsing and routing.
- `src/modules/portfolio-renderer/*`: reference navigation, pages, icons, assets, localized output.
- `src/modules/contact/*`, `src/packages/email/*`: validated, limited SMTP contact delivery.
- `src/modules/marketing/*`, `src/app/(marketing)/*`: dense public platform pages.
- `src/modules/seo/*`, `src/app/{sitemap,robots,feed,ads}*`: discovery and advertising surfaces.
- `src/tests/*`: unit, E2E, accessibility, and security behavior.

### Task 1: Purpose-aware file security

**Files:**

- Modify: `src/modules/file-security/constants/file-security.constants.ts`
- Modify: `src/modules/file-security/constants/file-signature.constants.ts`
- Modify: `src/modules/file-security/policies/file-inspection.policy.ts`
- Modify: `src/modules/file-security/types/file-security.types.ts`
- Test: `src/tests/unit/file-security.test.ts`

**Interfaces:**

- Produces: `inspectUpload(input: UploadInspectionInput): FileInspectionResult`
- `UploadInspectionInput` includes `purpose`, `filename`, `declaredMime`, and `bytes`.

- [x] Add failing table tests for CV PDF/DOC/DOCX, JPEG/PNG/WebP portraits and gallery images,
      PDF/image certificates, double extensions, signature disagreement, malformed dimensions, and
      purpose mismatch.
- [x] Run `npm test -- src/tests/unit/file-security.test.ts` and confirm the new rows fail.
- [x] Add bounded purpose policies and detected-type results without trusting browser MIME.
- [x] Re-run the focused test and `npm run typecheck:test`.

### Task 2: Owned asset persistence and lifecycle

**Files:**

- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_owned_assets/migration.sql`
- Create: `src/modules/assets/{index,server}.ts`
- Create: `src/modules/assets/types/*.ts`
- Create: `src/modules/assets/schemas/asset.schema.ts`
- Create: `src/modules/assets/repositories/asset.repository.ts`
- Create: `src/modules/assets/services/asset-upload.service.ts`
- Create: `src/modules/assets/services/asset-delete.service.ts`
- Test: `src/tests/e2e/assets.spec.ts`

**Interfaces:**

- Produces: `uploadOwnedAsset(ownerId, input)`, `deleteOwnedAsset(ownerId, assetId)`,
  `getPublishedAssetUnscoped(assetId)`.

- [ ] Write E2E cases for clean upload, infected rejection, scanner outage, cross-tenant access,
      random storage keys, and deletion.
- [ ] Run the focused E2E case and confirm the missing workflow fails.
- [ ] Add `Asset`/`AssetScanStatus`/`AssetPurpose` with owner and portfolio indexes.
- [ ] Implement authorize → quota → inspect → scan → store → persist, deleting stored bytes if the
      database write fails.
- [ ] Add private/public serving routes that authorize against published snapshots.
- [ ] Run migration, focused E2E, lint, and typecheck.

### Task 3: CV and editor asset integration

**Files:**

- Modify: `src/modules/resume-ingestion/services/resume-import.service.ts`
- Modify: `src/modules/portfolio-editor/*`
- Modify: `src/modules/portfolio-renderer/*`
- Test: `src/tests/e2e/golden-path.spec.ts`

**Interfaces:**

- Consumes: owned asset services from Task 2.
- Produces: secure portrait, gallery, certificate, cover-letter, and résumé attachment authoring.

- [ ] Extend the golden path with upload, review, publish, public image, and résumé download.
- [ ] Confirm failure before integration.
- [ ] Route CV storage through the common security service without weakening PDF parsing rules.
- [ ] Add editor upload controls and renderer omission behavior for absent assets.
- [ ] Run focused E2E, a11y, and build.

### Task 4: Complete factual extraction and mapping

**Files:**

- Modify: `src/modules/ai/schemas/resume-extraction.schema.ts`
- Modify: `src/modules/ai/constants/extraction-prompt.constants.ts`
- Modify: `src/modules/ai/mappers/extraction-to-document.mapper.ts`
- Modify: `src/modules/ai/providers/{deterministic-ai,model-ai}.provider.ts`
- Test: `src/modules/ai/test/*`

**Interfaces:**

- Produces: evidence-bound extraction for identity, contact, socials, soft/technical skills,
  experience, projects, education, courses/certifications, awards, languages, and attachments.

- [ ] Add failing fixtures for full, sparse, multilingual, and prompt-injection CV text.
- [ ] Require absent facts to map to null/empty and verify no inferred social URLs or skills.
- [ ] Extend schema, prompt, deterministic provider, repair, mapper, and warnings.
- [ ] Run AI unit tests, schema tests, coverage, and typecheck.

### Task 5: Full editor, pages, and private access

**Files:**

- Modify: `src/modules/portfolio-editor/*`
- Create: `src/modules/private-pages/*`
- Modify: `src/app/(public)/[portfolioSlug]/[[...pageSlug]]/page.tsx`
- Test: `src/tests/e2e/editor.spec.ts`, `src/tests/e2e/private-pages.spec.ts`

**Interfaces:**

- Produces: collection/page CRUD actions carrying `ownerId` and `expectedVersion`; page-scoped
  password challenge using an authenticated short-lived cookie.

- [ ] Add failing E2E for every collection, reorder, subpage, visibility, password setup/access,
      brute-force limiting, navigation hiding, sitemap hiding, stale update, and IDOR.
- [ ] Implement pure edit helpers first, then actions/services, then containers/components.
- [ ] Hash share passwords through the auth facade and never return hashes to clients.
- [ ] Run unit, E2E, accessibility, lint, and typecheck gates.

### Task 6: Account recovery and preferences

**Files:**

- Modify: `src/packages/auth/*`, `src/modules/auth/*`, `src/modules/account/*`
- Modify: `src/app/(auth)/*`, `src/app/dashboard/settings/page.tsx`
- Test: `src/tests/e2e/account.spec.ts`

**Interfaces:**

- Produces: verification request/consume, reset request/consume, password change, profile update,
  locale/theme/default-country preferences, logout, and session-safe responses.

- [ ] Add enumeration-safe reset and verification E2E cases.
- [ ] Configure better-auth verification/reset callbacks through the email facade.
- [ ] Add catalog-backed forms and bounded token/session behavior.
- [ ] Run account E2E and security/a11y checks.

### Task 7: Locale routing and stored Gemini translations

**Files:**

- Modify: `src/packages/i18n/*`, `src/proxy.ts`, `src/shared/constants/route-paths.constants.ts`
- Create: thirteen locale catalogs under `src/packages/i18n/messages/`
- Create: `src/modules/localization/*`
- Modify: `prisma/schema.prisma` and add translation migration
- Test: `src/tests/unit/locale-routing.test.ts`, `src/tests/e2e/localization.spec.ts`

**Interfaces:**

- Produces: `resolveLocalePath`, `translateOwnedDraft(ownerId, portfolioId, locale)`, and
  published locale snapshot reads.

- [ ] Add routing tests for `/`, `/en`, every supported locale, localized portfolios, invalid
      locale, RTL, canonicals, and language switching.
- [ ] Add a database model keyed by portfolio/locale/version/status and owner-scoped repository.
- [ ] Add a Gemini translation operation through the existing AI provider boundary.
- [ ] Validate, review, and separately publish translations; never translate on public reads.
- [ ] Run locale unit/E2E, sitemap, and metadata tests.

### Task 8: Reference-class renderer and UX

**Files:**

- Modify: `src/modules/portfolio-renderer/*`, `src/app/styles.css`
- Modify: `src/packages/icons/index.ts`, `src/packages/ui-primitives/*`
- Test: `src/tests/unit/portfolio-template.test.tsx`, `src/tests/accessibility/*`

**Interfaces:**

- Produces: responsive home/experience/projects/project/skills/about/résumé/contact/custom pages;
  real Home icon; overflow-aware arrow navigation; conditional social icons.

- [ ] Add failing behavior and accessibility tests for navigation, long content, empty fields,
      320px, keyboard arrows, touch targets, RTL, themes, and reduced motion.
- [ ] Adapt the reference layout to document props and semantic tokens.
- [ ] Ensure pointer cursors are applied centrally to enabled interactive controls.
- [ ] Run render unit tests, accessibility suite, and visual manual check.

### Task 9: SMTP contact delivery

**Files:**

- Create: `src/packages/email/*`, `src/modules/contact/*`, `src/app/api/contact/route.ts`
- Modify: `src/packages/env/*`, `.env.example`
- Test: `src/tests/unit/contact.test.ts`, `src/tests/e2e/contact.spec.ts`

**Interfaces:**

- Produces: `sendContactMessage(input, requestContext)` with SMTP/disabled adapters.

- [ ] Add tests for schema validation, header injection, honeypot, rate limit 3/hour, provider
      failure, secret-safe logs, and success.
- [ ] Add the SMTP vendor wrapper and conditional environment validation.
- [ ] Implement rate-limited delivery using the existing durable limiter.
- [ ] Run contact tests, lint, typecheck, and security audit.

### Task 10: Dense localized marketing site

**Files:**

- Create: `src/app/(marketing)/*/page.tsx`
- Modify: `src/modules/marketing/*`, locale catalogs, route constants, sitemap helpers
- Test: `src/tests/unit/marketing-content.test.ts`, `src/tests/accessibility/pages.spec.ts`

**Interfaces:**

- Produces: the seventeen approved public platform pages sharing typed content sections.

- [ ] Add tests that route inventory, catalogs, headings, metadata, and internal links are complete.
- [ ] Build reusable hero, prose, feature-grid, comparison, FAQ, CTA, and trust components.
- [ ] Author specific catalog copy for all launch locales; no placeholder text.
- [ ] Run unit, a11y, build, and dead-code checks.

### Task 11: Discovery, feeds, and AdSense

**Files:**

- Modify: `src/modules/seo/*`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/layout.tsx`
- Create: `src/app/feed.xml/route.ts`, `src/app/ads.txt/route.ts`
- Test: `src/tests/unit/seo-discovery.test.ts`, `src/tests/e2e/discovery.spec.ts`

**Interfaces:**

- Produces: public-only locale-aware sitemap/RSS, robots, metadata, OG previews, JSON-LD,
  `hreflang`, ads.txt, and nonce-compatible AdSense script.

- [ ] Add failing tests proving drafts/private pages never leak and every public localized page is
      represented correctly.
- [ ] Implement bounded XML/text responses and cache/revalidation behavior.
- [ ] Load the AdSense script once and preserve CSP.
- [ ] Run discovery tests, production build, and response-header checks.

### Task 12: Loading, performance, deployment, and final gate

**Files:**

- Create/modify: route `loading.tsx` files, image boundaries, `docs/deployment.md`,
  `docs/launch-readiness.md`, ClamAV deployment manifests under `deploy/clamav/`
- Test: E2E/a11y/security suites and production profiles

**Interfaces:**

- Produces: deployable Vercel app plus separately deployable private ClamAV service and complete
  operational checklist.

- [ ] Add measurable tests for loading semantics, image sizing, scanner health, and failure
      isolation.
- [ ] Parallelize only independent database/provider operations and remove request waterfalls.
- [ ] Add pinned ClamAV container configuration, healthcheck, private networking instructions, and
      signature-update runbook.
- [ ] Run `npm run validate` and record exact results.
- [ ] Run Lighthouse against production-mode mobile/desktop profiles and fix reproducible failures.
- [ ] Mark external secrets, DNS, SMTP, Gemini, storage, and scanner deployment as human-owned
      launch steps when they cannot be performed locally.
