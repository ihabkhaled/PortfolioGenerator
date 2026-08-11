# Critical Editor, Renderer, and Preferences Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make dense portfolios readable, make every editor error actionable without treating extraction warnings as blockers, preserve explicitly stated nationality and military status, repair portrait cropping, and restore account preferences automatically through a global authenticated menu.

**Architecture:** Public rendering remains a session-free database read. Renderer density is corrected with masonry-style columns, content-aware skill layouts, and container-query breakpoints so the live preview responds to its pane rather than the browser viewport. The editor keeps the canonical server schema authoritative but returns structured issue paths, maps them to controls, opens collapsed ancestors, and focuses issues from a persistent action dock. Account preferences continue using the existing owner-scoped repository and cookies, with sign-in synchronization and a shared platform-shell account menu.

**Tech Stack:** Next.js App Router, React, TypeScript 7/6 compatibility, Tailwind CSS, Zod, Prisma/PostgreSQL, next-intl-style catalogs, Vitest/Testing Library, Playwright.

## Global Constraints

- Never infer nationality or military status; extract only an exact statement present in the resume.
- Extraction warnings are advisory and never block draft saving.
- Structurally invalid, unsafe, or over-limit documents remain rejected by `portfolioDocumentSchema`.
- Public portfolio rendering must not import authenticated, authoring, or account code.
- Every new user-facing string must exist in all 13 locale catalogs.
- Required markers apply only to fields required by the canonical schema.
- All floating controls must respect mobile safe areas and the PWA banner.
- Do not weaken lint, coverage, typecheck, accessibility, security, or E2E gates.

---

### Task 1: Dense public portfolio layouts and complete contact evidence

**Files:**

- Modify: `src/modules/portfolio-renderer/constants/template-style.constants.ts`
- Modify: `src/modules/portfolio-renderer/components/section-renderer.tsx`
- Modify: `src/modules/portfolio-renderer/components/hero-section.component.tsx`
- Modify: `src/modules/portfolio-renderer/components/projects-section.component.tsx`
- Modify: `src/modules/portfolio-renderer/components/skills-section.component.tsx`
- Modify: `src/modules/portfolio-renderer/components/portfolio-template.tsx`
- Modify: `src/modules/portfolio-editor/constants/editor-style.constants.ts`
- Test: `src/tests/unit/renderer-sections.test.tsx`
- Test: `src/tests/unit/portfolio-template.test.tsx`

**Interfaces:**

- Preserve `toTelHref(phone: string): string | null` as the only phone-link formatter.
- Add renderer-local container-query classes rooted at the portfolio template.
- Keep hero/contact visibility gates; do not display private phone data when `visible` is false.

- [ ] Add failing renderer tests proving project cards do not use shared CSS-grid rows, a single skill group does not create a second panel, hero evidence orders location/email/phone/social links, and phone anchors use `tel:`.
- [ ] Run the focused tests and confirm failures describe the current grid, forced skill track, and social placement.
- [ ] Replace the project row grid with responsive CSS columns and `break-inside-avoid` cards so a tall card cannot hold the next row down.
- [ ] Replace the forced two-column skills track with content-aware auto-fit sizing; a single group consumes the available panel.
- [ ] Move hero social links beneath location, email, and phone in the evidence aside while retaining contact-section social links.
- [ ] Make renderer section rails, hero, cards, and navigation react to the preview container width; remove transform-based preview scaling that leaves desktop breakpoints active in a narrow pane.
- [ ] Run renderer/template unit tests and capture public screenshots at 390px and 1440px plus editor-preview screenshots at its actual pane width.

### Task 2: Localized, progressively disclosed editor structure

**Files:**

- Create: `src/modules/portfolio-editor/components/editor-disclosure.component.tsx`
- Modify: `src/modules/portfolio-editor/containers/portfolio-editor.container.tsx`
- Modify: `src/modules/portfolio-editor/containers/collection-manager.container.tsx`
- Modify: `src/modules/portfolio-editor/components/collection-entry.component.tsx`
- Modify: `src/modules/portfolio-editor/constants/editor-style.constants.ts`
- Modify: `src/packages/i18n/messages/{en,ar,de,es,fa,fr,hi,it,ja,pt,ru,th,zh}.json`
- Test: `src/tests/unit/portfolio-editor-interactions.test.tsx`
- Test: `src/tests/unit/translator.test.ts`

**Interfaces:**

- `EditorDisclosure` uses native `details/summary`, accepts `id`, `title`, `summary`, `defaultOpen`, and `children`, and exposes a stable ancestor ID for issue navigation.
- Section labels use `portfolio.sections.<type>` for every value in `SECTION_TYPES`.

- [ ] Add failing tests for keyboard-operable major disclosures, localized attachment/social/supplemental labels, item counts, and collapsed collection entries.
- [ ] Add all missing `portfolio.sections` keys to English and mirror translations from existing `portfolio.supplemental` labels across the other 12 catalogs.
- [ ] Wrap major editor groups in bordered native disclosures; keep Identity open initially and collapse secondary groups.
- [ ] Give each collection its own summary and item count, and collapse individual entries behind a meaningful title without placing buttons inside `summary`.
- [ ] Add quiet dividers and clear hierarchy while preserving heading semantics and keyboard operation.
- [ ] Run editor interaction, translator parity, and accessibility-focused unit tests.

### Task 3: Structured validation, required markers, and persistent action dock

**Files:**

- Create: `src/modules/portfolio-editor/helpers/editor-issue-target.helper.ts`
- Create: `src/modules/portfolio-editor/components/editor-issue-navigator.component.tsx`
- Modify: `src/modules/portfolio-editor/actions/editor.actions.ts`
- Modify: `src/modules/portfolio-editor/types/editor.types.ts`
- Modify: `src/modules/portfolio-editor/types/draft-editor.types.ts`
- Modify: `src/modules/portfolio-editor/hooks/use-draft-editor.hook.ts`
- Modify: `src/modules/portfolio-editor/containers/portfolio-editor.container.tsx`
- Modify: editor identity/contact/SEO/page/asset/collection field components
- Modify: `src/modules/portfolio-editor/constants/editor.constants.ts`
- Modify: `src/modules/portfolio-editor/constants/editor-style.constants.ts`
- Modify: all 13 locale catalogs
- Test: `src/tests/unit/document-edit.test.ts`
- Test: `src/tests/unit/portfolio-editor-interactions.test.tsx`
- Test: `src/tests/unit/containers.test.tsx`
- Test: `src/tests/e2e/editor.spec.ts`
- Test: `src/tests/accessibility/keyboard.spec.ts`

**Interfaces:**

- Extend error action state to `issues: readonly { path: readonly (string | number)[]; code: string }[]` without returning submitted values or raw Zod prose.
- `resolveEditorIssueTarget(document, issue)` converts array indices to stable item IDs and returns `{ controlId, disclosureIds } | null`.
- Required collection definitions expose `required: boolean` and controls render native `required`, `aria-required`, a visible `*`, and localized screen-reader text.

- [ ] Add failing action tests proving schema issues retain safe paths/codes and extraction warnings do not affect save status.
- [ ] Add failing interaction tests proving an issue opens all collapsed ancestors, marks the exact control with `aria-invalid`, associates an inline message, scrolls/focuses it, and cycles Previous/Next.
- [ ] Preserve structured parse issues through the action, hook, and editor state while keeping the server schema authoritative.
- [ ] Map issue paths to stable control IDs; show a truthful count and keep unmapped root issues in a general list.
- [ ] Add required markers only to schema-required fields and never to optional location/date/provider/contact fields.
- [ ] Add a fixed mobile-safe action dock containing status, Save, and issue navigation; reserve bottom space and position it above the PWA prompt.
- [ ] When navigating from mobile Preview, switch to Edit before opening ancestors and focusing the field.
- [ ] Replace misleading generic copy with exact issue-count guidance and remove any claim that fields are highlighted unless a mapped field is actually highlighted.
- [ ] Run focused unit tests and the keyboard/mobile Playwright scenarios.

### Task 4: Exact sensitive fields, overlap policy, and document migration

**Files:**

- Modify: `src/modules/ai/constants/extraction-prompt.constants.ts`
- Modify: `src/modules/ai/schemas/resume-extraction.schema.ts`
- Modify: `src/modules/ai/mappers/extraction-to-document.mapper.ts`
- Modify: `src/modules/portfolio-document/schemas/portfolio-document.schema.ts`
- Create: `src/modules/portfolio-document/helpers/portfolio-document-v4.migration.ts`
- Modify: portfolio document migration/default/constants helpers
- Modify: editor identity types/components/container
- Modify: renderer labels/contact evidence
- Modify: all 13 locale catalogs
- Test: AI extraction/mapper tests, document schema/migration tests, editor and renderer tests

**Interfaces:**

- Document version 4 identity adds `nationality: string | null` and `militaryStatus: string | null`.
- V3-to-V4 migration sets both fields to `null`; no database migration is required because the document is JSONB.
- Extraction prompt permits only explicit statements and forbids warnings solely because experience intervals overlap.

- [ ] Write failing schema/mapper/migration tests for exact nationality and military-status preservation and null migration defaults.
- [ ] Write a failing prompt contract test proving overlap alone is valid and sensitive fields may never be inferred.
- [ ] Add nullable fields through extraction, mapping, document v4, defaults, editor, renderer evidence, and all locale labels.
- [ ] Keep both fields optional and reviewable; never synthesize them and never make them publish requirements.
- [ ] Prevent future overlap-only warnings at the extraction prompt; do not broadly filter unrelated model warnings.
- [ ] Run extraction, document, migration, editor, renderer, and translator tests.

### Task 5: Stable focal-point portrait cropping

**Files:**

- Create: `src/modules/portfolio-editor/helpers/image-crop-geometry.helper.ts`
- Modify: `src/modules/portfolio-editor/containers/image-crop-field.container.tsx`
- Modify: `src/modules/portfolio-editor/constants/editor-style.constants.ts`
- Test: `src/tests/unit/image-crop-field.test.tsx`
- Test: `src/tests/unit/image-crop-geometry.test.ts`

**Interfaces:**

- `zoomAroundViewportCenter(input): ImageCropPoint` scales the existing focal point around the viewport center, then clamps against the next rendered dimensions.

- [ ] Add failing pure tests for minimum/maximum zoom, centered images, non-zero pan, and clamping at each edge.
- [ ] Add a failing component test proving slider changes preserve the visible focal point instead of the top-left offset.
- [ ] Extract geometry and recalculate offsets from `nextZoom / currentZoom` around the viewport center before clamping.
- [ ] Re-clamp the crop when viewport dimensions change and keep existing canvas output dimensions/MIME behavior.
- [ ] Run geometry, crop component, and browser slider verification.

### Task 6: Persistent preferences and authenticated account menu

**Files:**

- Create: `src/shared/components/layout/account-menu.container.tsx`
- Modify: `src/shared/components/layout/site-shell.variants.ts`
- Modify: `src/shared/components/layout/site-auth-nav.component.tsx`
- Modify: `src/app/(marketing)/layout.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/dashboard/layout.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`
- Modify: `src/modules/account/containers/account-preferences.container.tsx`
- Modify: `src/modules/auth/actions/auth.actions.ts`
- Add a declared server-side preference synchronization service without a cross-module repository import
- Modify: all 13 locale catalogs
- Test: shared layout/menu tests, account preference tests, auth action tests, runtime preference tests
- Test: authenticated preference Playwright scenario

**Interfaces:**

- `AccountMenu` accepts `name`, `email`, localized labels, dashboard/settings hrefs, and the existing sign-out action; its avatar initial uses the first visible Unicode character of the first name with email fallback.
- `synchronizePersistedPreferences(ownerId)` loads owner-scoped locale/theme and overwrites both response cookies after successful sign-in.
- Preference selects autosubmit the complete locale/theme/default-country payload and expose pending/saved/error live status.

- [ ] Add failing tests for avatar initials, Dashboard/Preferences/Logout entries, keyboard/details operation, and signed-out navigation.
- [ ] Add failing sign-in tests proving missing or stale locale/theme cookies are overwritten from the account record.
- [ ] Add the shared menu to marketing, root-home, and dashboard platform headers; do not import it into the cacheable public portfolio renderer.
- [ ] Reuse `/dashboard/settings` as Preferences, retaining password change, verification, sessions, account data, and deletion controls.
- [ ] Autosave complete preference payloads on change, preview theme immediately, refresh locale after the cookie is saved, and render action errors.
- [ ] Resolve cookie/local-storage precedence so account preference wins after sign-in without a flash of the previous theme.
- [ ] Run unit, translator, keyboard, and clean-context login/restore E2E tests.

### Task 7: Full verification and existing E2E infrastructure failures

**Files:**

- Inspect/fix only when evidence identifies root cause: `src/tests/e2e/**`, `playwright.config.ts`, `.github/workflows/e2e.yml`, PWA manifest assets, and auth test setup

- [ ] Reproduce the prior GitHub E2E failure locally against a clean migrated database. The prior run showed widespread sign-in waits for `/dashboard`, plus a PWA manifest dimension mismatch (expected 512, received 640); treat these as separate root causes.
- [ ] Repair the shared authentication/setup boundary if it caused the cascade; do not increase test timeouts or weaken assertions.
- [ ] Correct manifest asset metadata or actual image dimensions so every declared icon matches its decoded dimensions.
- [ ] Run `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm run test:coverage`, `npm run build`, `npm run quality:dead-code`, `npm run quality:circular`, and `npm run security:audit`.
- [ ] Run focused browser visual checks for public desktop/mobile, editor preview, disclosure/error navigation, crop zoom, PWA overlap, and account menu/preferences.
- [ ] Run `npm run test:e2e` and `npm run test:a11y` against a clean real PostgreSQL database.
- [ ] Stage only intended files, commit in coherent testable units, push `main`, and watch CI, Security, and E2E to completion.
