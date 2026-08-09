# PortfolioGenerate Product Expansion Design

Status: approved architecture; awaiting written-spec review
Date: 2026-08-09
Sources: current repository, `portfolio-generator-prompt-pack`, and the public reference portfolio

## 1. Objective

Complete PortfolioGenerate as a multi-tenant product that turns an uploaded CV into a reviewed,
editable, secure, multilingual portfolio. Public portfolios use the information architecture and
interaction quality of the reference site while remaining database-driven and tenant-safe.

The product invariants remain unchanged:

1. Extraction reports facts present in source material and never invents missing facts.
2. AI output always becomes a draft that the owner reviews before publishing.
3. Published pages render from stored, validated snapshots without AI, file parsing, or object
   storage availability.
4. Every dashboard data operation is owner-scoped.

## 2. Current-state audit

The repository already contains working foundations that must be integrated rather than rebuilt:

- Portfolio draft/published snapshots, owner-scoped repositories, portfolio CRUD, soft deletion,
  dynamic pages, subpages, page visibility, and private-page password hashes.
- A broad `PortfolioDocument` covering identity, experience, projects, skill groups, education,
  certifications, languages, awards, social links, attachments, page composition, theme, and SEO.
- CV PDF signature checks, text extraction, structured AI extraction, ingestion state, private
  storage adapters, and deterministic test providers.
- File signature/dimension policies, a ClamAV TCP client, scanner provider, and environment schema.
- A public renderer with hero, about, experience, projects, skills, education, certifications,
  languages, contact, and custom sections.
- Theme bootstrap and toggle, country/telephone metadata, SEO metadata, OG images, structured data,
  robots, sitemap, AdSense constants, authentication, settings, sign-out, deletion, rate limiting,
  audit events, and extensive quality gates.

Incomplete work is integration depth and product breadth: secure asset workflows, complete editor
coverage, password recovery and verification, contact delivery, locale routing/catalogs, stored
portfolio translations, dense platform pages, RSS/ads.txt, reference-quality navigation and visual
polish, and production deployment of the scanning dependency.

## 3. Delivery structure

### Release 1: secure file platform

One asset pipeline accepts CVs, portraits, gallery images, certificates, cover letters, and public
attachments. Each upload declares an allowed purpose. The purpose selects exact size limits,
extensions, MIME types, magic-byte signatures, image dimensions, and public/private policy.

Validation order:

1. authenticate and resolve owner;
2. enforce quota and rate limit;
3. normalize filename and reject ambiguous/double extensions;
4. enforce byte size;
5. identify content from magic bytes;
6. require agreement between purpose, extension, declared MIME, and detected content;
7. parse structural metadata with bounded work;
8. stream bytes through ClamAV;
9. store under a random server-generated key only after a clean result;
10. persist ownership, purpose, hash, scan result, and lifecycle state.

Production is fail-closed: scanner timeout, protocol error, or unavailable ClamAV rejects the
upload. Development may use the disabled scanner only when explicitly configured. Raw CVs remain
private. Portrait/gallery assets may be served through an owned asset route. Downloadable résumé
and certificate assets are public only when referenced by a published snapshot and marked public.

ClamAV runs as a separate persistent container with current signature updates and a private network
endpoint. Vercel remains the application host and connects to the scanner through configuration;
the design does not pretend a long-lived daemon can run inside a serverless function.

### Release 2: complete document and AI authoring

The canonical document includes factual fields for profile, contact, telephone country calling
code plus national number, summary, soft skills, technical skill groups, work experience,
education, courses/certifications, projects, awards, languages, social links, gallery items,
attachments, cover letter, custom blocks, pages, navigation, theme, and SEO.

Supported social kinds are GitHub, Behance, LinkedIn, YouTube, TikTok, Instagram, Facebook, X,
Mastodon, Bluesky, Dribbble, Stack Overflow, Medium, personal website, and an explicitly labelled
custom HTTPS link. The renderer emits only visible, non-empty, validated links and uses accessible
icons with text alternatives.

AI extraction uses a strict structured-output schema and field-level evidence/warnings. Missing
source facts remain null or empty. Writing enhancements are separate owner-triggered operations and
cannot silently replace factual content. Upload never publishes.

Gemini translation is an authoring job. It translates selected platform-supported portfolio
content into a locale-specific stored snapshot, validates the translated document, shows it for
review, and publishes it deliberately. Public requests never call Gemini.

### Release 3: complete authoring and account surfaces

The editor exposes every canonical collection and supports add, edit, delete, reorder, visibility,
and safe previews. It supports portrait/gallery/attachment uploads, résumé download settings,
pages and subpages, public/private visibility, and owner-defined share passwords. Passwords are
hashed and never stored or logged in plaintext. Successful access creates a short-lived,
page-scoped authorization cookie; private content emits `noindex`, is excluded from discovery, and
does not leak in navigation to unauthorized readers.

Account settings cover name, image, locale, theme preference, default country calling code,
password change, email verification status, password reset, active session logout, portfolio CRUD,
and account deletion. Reset and verification tokens are single-use, expire, and do not reveal
whether an email address exists.

Telephone storage separates calling code and national number. Formatting is presentation-only and
uses a complete ISO country/calling-code dataset, including shared calling codes and territories.

### Release 4: reference-class public renderer and localization

The public renderer follows the reference site's information architecture: home, experience,
projects, project detail, skills, about, résumé, contact, and owner-created pages. Navigation has a
real Home icon/link, overflow arrows only when navigation actually overflows, keyboard scrolling,
active-state semantics, touch-friendly targets, and no empty entries.

The root platform URL remains English without redirect. English is also addressable under `/en`;
localized routes use `/ar`, `/de`, `/es`, `/fa`, `/fr`, `/hi`, `/it`, `/ja`, `/pt`, `/ru`, `/th`,
and `/zh`. The same model applies to portfolios: `/{slug}` is default English and
`/{locale}/{slug}` selects stored localized content. Canonicals and `hreflang` prevent duplicate
English indexing. Arabic and Persian render RTL; logical CSS properties keep all layouts safe.

Platform copy lives only in catalogs. Supported launch catalogs are Arabic, Chinese, English,
French, German, Hindi, Italian, Japanese, Persian, Portuguese, Russian, Spanish, and Thai.

Theme selection supports system, light, and dark without a flash of the wrong theme. All
interactive controls use visible focus, appropriate pointer cursors, minimum touch targets, and
reduced-motion preferences.

### Release 5: platform content and contact

The marketing surface contains at least these useful public routes:

1. Home
2. Features
3. How it works
4. Examples
5. Templates
6. CV import
7. AI and factual accuracy
8. Security
9. Privacy
10. About
11. Mission
12. Contact
13. Help
14. FAQ
15. Accessibility
16. Terms
17. Changelog

Pages are content-dense but scannable, with clear headings, internal links, calls to action, proof
points, examples, and responsive spacing. Copy must be specific and useful rather than filler.

Contact submission validates and normalizes fields, uses a honeypot and database-backed rate limit,
and delivers through an SMTP provider facade. Configuration supports the provided Brevo relay
variables. Credentials remain deployment secrets; blank SMTP user/password make production
configuration invalid when email is enabled. Responses do not expose delivery internals.

### Release 6: discovery, performance, and launch

Every indexable page receives a distinct title, description, canonical, Open Graph/Twitter preview,
appropriate image, structured data, and language alternates. Published public portfolio pages and
project pages appear in sitemap output. Drafts and private pages never appear.

RSS exposes newly published or republished public portfolios/pages without private content.
`robots.txt` allows public content while disallowing authenticated, API, preview, and private
surfaces. This is the secure interpretation of “allow everything”: all content intended for public
discovery is crawlable; access-controlled content is not advertised.

`/ads.txt` contains:

```text
google.com, pub-2415314275784926, DIRECT, f08c47fec0942fa0
```

The root metadata contains `google-adsense-account=ca-pub-2415314275784926`, and the official
AdSense script loads once, asynchronously, with `crossorigin="anonymous"` under the nonce-based
content security policy.

Loading states use route-level skeletons for meaningful server waits, local pending states for
mutations, responsive images, lazy loading below the fold, and parallel independent reads. APIs
are split only at real ownership/reliability boundaries; artificial endpoint proliferation is not
treated as SOLID design.

The measurable target is Lighthouse 100/100 where reproducible on the agreed desktop and mobile
profiles, with no claim beyond Lighthouse's 0–100 scale. Hard gates remain WCAG 2.2 AA, zero known
high/critical production advisories, production build success, complete tenancy/security E2E, and
the repository's lint/type/coverage/architecture thresholds.

## 4. Data and module changes

- Add an owner-scoped `Asset` model with purpose, visibility, detected type, size, hash, storage
  key, scan state, metadata, timestamps, and soft deletion.
- Add portfolio locale snapshots or an owner-scoped translation model keyed by portfolio, locale,
  draft/published version, and status.
- Add bounded contact-delivery audit data without storing message bodies longer than operationally
  necessary.
- Extend existing modules rather than bypassing their surfaces: `file-security`, `storage`,
  `resume-ingestion`, `portfolio-document`, `ai`, `portfolio-editor`, `portfolio-renderer`, `seo`,
  `auth`, `account`, `preferences`, `rate-limit`, and `audit`.
- Add focused modules for `assets`, `contact`, and `localization` if existing module boundaries
  cannot own those responsibilities cleanly.

All repository reads and writes in authoring paths include `ownerId`. Public reads use explicitly
named unscoped methods and only published snapshots.

## 5. Failure behavior

- A scanner outage blocks new uploads but does not affect published pages.
- An AI or Gemini outage preserves the last draft and published snapshots and offers retry.
- SMTP failure returns a bounded retryable response and records operational metadata without
  leaking credentials or message content.
- Invalid or stale translations cannot publish.
- Missing assets render no broken placeholder and do not break surrounding sections.
- Private-page authentication failure reveals neither content nor password details.
- Empty extracted fields stay empty and their components are omitted.

## 6. Verification strategy

Every behavior change follows red-green-refactor. Pure schemas, policies, mappers, formatters,
locale routing, discovery filters, and content selection retain 100% coverage. E2E uses real
PostgreSQL, deterministic AI, deterministic SMTP and scanner test doubles, plus a real ClamAV smoke
profile outside unit coverage.

Required adversarial fixtures include extension/MIME/signature disagreement, polyglot files,
oversized/decompression-heavy inputs, corrupt images, encrypted/scanned PDFs, malware test string,
path traversal names, tenant IDOR, prompt injection text, private sitemap leakage, password brute
force, contact spam, stale writes, missing translation, RTL/long text, and 320px navigation.

Manual launch checks cover real mobile devices, touch navigation, email delivery, ClamAV signature
updates, OG previews, localized canonicals, screen reader landmarks, and restore procedures.

## 7. Explicit boundaries

- No invented résumé facts.
- No automatic publish after upload or translation.
- No raw HTML, arbitrary CSS/JavaScript, remote URL fetching, or social scraping.
- No public raw CV object keys.
- No plaintext page passwords.
- No AI call on a public request.
- No claim that ClamAV runs inside Vercel; it is separately deployed.
- Custom domains and team workspaces remain excluded unless separately designed.

## 8. Completion definition

### Post-implementation audit clarification

“Implemented” means the behavior is complete across every supported locale and access mode, not
merely that a route, schema, or control exists. In particular, completion now expressly requires:

- full authored catalog parity for all thirteen locales with no silent English fallback;
- editable, source-version-aware AI translation drafts followed by explicit review and publish;
- a real privacy-safe PWA whose worker never caches authenticated, private, API, or uploaded CV
  responses;
- production-enforced ClamAV rather than a deploy-time recommendation;
- imported CV download and page-bound media authorization that cannot bypass private pages;
- complete evidence-bound extraction and page composition for supported CV facts;
- complete country/territory dial codes, responsive/RTL/theme proof, and dense localized platform
  content;
- authoritative unit, E2E, accessibility, security, Lighthouse, PWA, and deployment evidence.

The revised authoritative backlog is maintained at the top of
`docs/superpowers/plans/2026-08-09-product-expansion-plan.md`. A passing narrow test or the absence
of a compiler error cannot substitute for that requirement-by-requirement proof.

Each release is complete only when its unit, E2E, accessibility, security, migration, and production
build checks pass, its deployment variables/runbook are documented, and the launch-readiness audit
clearly marks what is automated, manually verified, or still dependent on external credentials or
infrastructure.
