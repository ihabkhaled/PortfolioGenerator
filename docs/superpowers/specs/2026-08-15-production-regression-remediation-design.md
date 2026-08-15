# Production Regression Remediation Design

## Objective

Eliminate the confirmed production crashes, make uploaded assets durable, import every evidence-backed CV field the editor can represent, and establish repeatable local and deployed regression evidence without weakening tenant isolation, validation, or the no-invention guarantee.

## Runtime and storage

Playwright and Chromium are loaded only by an actual PDF-generation request. The deployment must trace the Playwright metadata required at runtime, while unrelated server actions remain independent of the PDF stack. Public production deployments require S3-compatible object storage; Vercel's temporary filesystem remains available only for non-public preview and development environments.

Database connections use the existing Prisma facade and receive only bounded handling appropriate to idempotent reads. Mutating operations are not blindly retried. Authentication redirects remain server-action redirects, verification-token claims are idempotent under concurrent callbacks, and sign-out remains successful when the session has already disappeared.

## Portrait editor

Contain/full-photo framing centers an image on every axis where the rendered image is smaller than the viewport. Crop framing continues to clamp every viewport edge. Export always draws into the canvas's actual dimensions. Portrait controls remain discoverable in the editor and are covered by unit and browser tests.

## CV document model and import

The canonical document gains an evidence-backed company representation derived only from explicit employer facts. Imported page and section order is preserved when the source exposes reliable structure; otherwise the existing deterministic page composition is used. The extraction contract expands to editor-supported collections that can be stated in a CV, but it does not fabricate testimonials, gallery media, arbitrary downloads, or facts absent from the document.

Every dropped or truncated entry produces a bounded warning visible during review. Missing schema-required facts remain empty and are reported; they are never synthesized. The deterministic provider implements the same supported factual collections as the remote-provider contract using conservative, documented line formats.

## UI and accessibility

The PWA prompt must not obscure primary dashboard actions at supported viewport sizes. Password input and visibility controls have unique accessible names. Portrait and import entry points are reachable and understandable without relying on hidden navigation.

## Evidence and release

Automated coverage includes import mapping for every supported collection, count boundaries, verification-required sign-up, sign-out, portrait upload/crop, production import isolation, storage configuration, and PDF download. A dense factual CV fixture supplies literal expected values. The release sequence is local full gates, local manual CRUD/auth/import/publish, production deployment, production manual regression, test-data cleanup, Vercel log review, commit/push, and green GitHub checks.

## Constraints

- Nothing is invented from a CV.
- Import creates a draft; publication remains deliberate.
- Published rendering remains a database read.
- Every dashboard repository operation remains owner-scoped.
- Stored JSON continues through `portfolioDocumentSchema` and migrations.
- Production mutations are not retried unless they are provably idempotent.
- Existing unrelated worktree changes are preserved.
