# Production Regression Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the complete confirmed regression list, deploy it safely, and prove all affected workflows locally and in production.

**Architecture:** Four bounded workstreams change independent module surfaces, followed by one integration and release sequence. Schema changes use the existing document migration chain; infrastructure remains behind package facades; browser evidence uses disposable regression data.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 7/6, Prisma/PostgreSQL, Zod, Vitest, Playwright, Vercel, S3-compatible storage.

**Spec:** `docs/superpowers/specs/2026-08-15-production-regression-remediation-design.md`

## Global Constraints

- Never invent CV facts or silently fill required fields.
- Preserve owner scoping, layer direction, message-catalog use, design-system classes, and package facades.
- Use TDD for every behavior change and retain 100% pure-logic / 95% unit coverage gates.
- Work in the current main worktree and branch; preserve pre-existing changes.
- Do not deploy or push until the complete local gate is green.
- Production validation uses the supplied test account and cleans disposable data afterward.

---

### Task 1: Production runtime and server-action isolation

**Files:**

- Modify: `src/modules/portfolio-pdf/providers/playwright-portfolio-pdf-renderer.provider.ts`
- Modify: `src/packages/pdf-renderer/browser-print.ts`
- Modify: `next.config.ts`
- Test: `src/modules/portfolio-pdf/test/renderer-import-boundary.test.ts`
- Test: portfolio PDF unit/E2E suites

- [ ] Preserve the failing import-boundary regression for eager Playwright loading.
- [ ] Keep browser imports behind `renderPortfolioPdf` and add the minimum Vercel trace configuration for required Playwright metadata.
- [ ] Add a PDF-download production-build test that proves unrelated actions do not load the browser runtime.
- [ ] Run targeted tests, lint, typecheck, and production build.

### Task 2: Durable production storage and operational configuration

**Files:**

- Modify: `src/packages/env/env.schema.ts`
- Modify: `src/packages/env/server.ts`
- Modify: storage configuration tests
- Modify: `.env.example`, `docs/deployment.md`, `docs/launch-readiness.md`

- [ ] Add a failing test proving a public production environment rejects the local storage driver.
- [ ] Require `STORAGE_DRIVER=s3` and complete S3 credentials for public production while retaining local/preview support.
- [ ] Verify health checks exercise the configured object store without exposing keys.
- [ ] Confirm Vercel environment configuration before deployment.

### Task 3: Portrait crop/export and discoverability

**Files:**

- Modify: `src/modules/portfolio-editor/helpers/image-crop-geometry.helper.ts`
- Modify: `src/modules/portfolio-editor/containers/image-crop-field.container.tsx`
- Modify: editor navigation/component surfaces if discoverability remains deficient
- Test: `src/tests/unit/image-crop-geometry.test.ts`
- Test: `src/tests/unit/image-crop-field.test.tsx`
- Test: `src/tests/e2e/assets.spec.ts`

- [ ] Retain red-green coverage for contained-image centering and exact canvas destination dimensions.
- [ ] Test cover/full modes, every aspect ratio, zoom extremes, portrait/landscape sources, panning, cancellation, and upload.
- [ ] Make portrait controls reachable from the normal editor flow.
- [ ] Run browser visual checks at mobile and desktop sizes.

### Task 4: Authentication and verification reliability

**Files:**

- Modify: `src/modules/auth/actions/auth.actions.ts`
- Modify: `src/app/(auth)/sign-in/page.tsx`
- Modify: auth containers/types/constants as required
- Modify: `src/packages/auth/email-verification-claim.ts`
- Test: auth action/unit suites
- Test: `src/tests/e2e/account.spec.ts`

- [ ] Add failing tests for verification-required sign-up redirect and displayed notice.
- [ ] Add direct sign-out action regression coverage, including an already-missing session.
- [ ] Make verification-token claiming idempotent under concurrent callbacks without accepting an invalid token.
- [ ] Validate login, signup, verification notice, logout, and protected-route redirects locally.

### Task 5: CV schema, companies, and source structure

**Files:**

- Modify: `src/modules/portfolio-document/schemas/`
- Modify: `src/modules/portfolio-document/types/`
- Modify: document defaults/migration chain/constants
- Modify: editor document helpers/components
- Test: document schema, migration, editor, and rendering suites

- [ ] Define an evidence-backed company entity and source-order metadata without duplicating or inventing employer facts.
- [ ] Add the next document-version migration and preserve all published older documents.
- [ ] Expose companies and imported ordering through editor and renderer surfaces.
- [ ] Verify tenant-free public rendering still imports no authoring code.

### Task 6: Complete extraction, deterministic parity, and warnings

**Files:**

- Modify: `src/modules/ai/schemas/resume-extraction.schema.ts`
- Modify: `src/modules/ai/constants/extraction-prompt.constants.ts`
- Modify: `src/modules/ai/helpers/deterministic-extraction.helper.ts`
- Modify: `src/modules/ai/mappers/extraction-to-document.mapper.ts`
- Modify: resume-ingestion review UI/message catalogs
- Test: AI schema/mapper/deterministic suites
- Test: dense import fixtures and E2E suites

- [ ] Create a dense factual CV fixture containing every supported collection and explicit company/institution data.
- [ ] Add failing literal assertions for every extracted field, page, section, company, and ordering decision.
- [ ] Implement conservative deterministic parsers for all supported factual collections.
- [ ] Surface truncation and dropped-entry warnings with exact paths and reasons.
- [ ] Explicitly report unsupported media/testimonial/custom-page content rather than silently promising extraction.

### Task 7: PWA, accessibility, and editor entry points

**Files:**

- Modify: PWA install prompt container/style constants
- Modify: auth credential form component
- Modify: editor navigation/components
- Test: component, responsive, accessibility, and keyboard suites

- [ ] Add a responsive test proving the install prompt never covers primary actions.
- [ ] Give password input and visibility button distinct accessible names/relationships.
- [ ] Add keyboard and screen-reader coverage for portrait and CV entry points.

### Task 8: Database resilience and SSL configuration

**Files:**

- Modify: `src/packages/database/` configuration/facade
- Modify: environment schema and deployment documentation
- Test: database configuration and safe read-recovery tests

- [ ] Characterize `P1017`/connection-closed behavior at read boundaries.
- [ ] Add bounded recovery only for idempotent reads; never replay unknown mutations.
- [ ] Make PostgreSQL SSL intent explicit for current and upcoming driver semantics.
- [ ] Validate pool sizing against Vercel and the configured Postgres provider.

### Task 9: Integrated automated regression

**Files:**

- Modify: `src/tests/e2e/account.spec.ts`
- Modify: `src/tests/e2e/assets.spec.ts`
- Modify: `src/tests/e2e/golden-path.spec.ts`
- Add/update dense CV and image fixtures

- [ ] Cover signup/login/logout, create/import/edit/save/upload/publish/download/unpublish/delete.
- [ ] Assert every dense CV collection and generated editor page.
- [ ] Assert portrait persistence across a fresh browser context.
- [ ] Assert test-data cleanup in teardown.
- [ ] Run `npm run validate` once on the integrated tree.

### Task 10: Manual release validation and delivery

**Files:**

- Update: regression evidence/audit documentation if repository convention requires it

- [ ] Manually execute every affected workflow at `http://localhost:3010` using desktop and mobile viewports.
- [ ] Review the final diff and run the complete quality/security gate.
- [ ] Commit cohesive changes on `main` with messages explaining why.
- [ ] Push `main`, wait for all GitHub checks, and resolve any genuine failures.
- [ ] Deploy the exact green commit to Vercel.
- [ ] Repeat the full manual regression on production, inspect Vercel logs, verify durable asset retrieval, and download a generated PDF.
- [ ] Delete `ihab-regression-20260815` and all other disposable production/local regression data.
- [ ] Record exact pass/fail evidence and stop when every required row is proven.
