# The system, briefly

## What it does

A person uploads a PDF CV. The platform extracts structured content from it,
shows them what it found, lets them correct it, and publishes it as a portfolio
website at an address they choose: `https://<host>/<slug>`.

## The three commitments

1. **Nothing is invented.** A field the CV does not contain stays empty. The
   extraction schema is nullable everywhere so the model always has a legal way
   to say "not present", and the mapper drops what it cannot use rather than
   guessing.
2. **A person reviews before anything is public.** Import produces a draft.
   Publishing is separate and deliberate.
3. **A published portfolio is a database read.** It renders when the AI
   provider, the PDF parser and object storage are all unavailable.

## The stack

Next.js 16 App Router with Server Actions, React 19, TypeScript 7, Tailwind 4,
Prisma 7 on PostgreSQL, better-auth, the Vercel AI SDK, and an S3-compatible
object store. No Redis, no queue, no cron.

## The data model in one paragraph

A `Portfolio` row owns a globally unique `slug`, a `draftDocument` and a
`publishedDocument` — both JSONB holding a `PortfolioDocument`, whose canonical
shape is a Zod schema. Publishing copies draft to published in one transaction.
A `ResumeUpload` row points at private object storage. An `AiRun` row records
every model call's metadata and no text. An `AuditEvent` row records every change
to what the public can see.

## The layers

```
src/app        routes, thin
src/modules    features, layered, exported through named surfaces
src/packages   one vendor each, behind a facade
src/shared     generic, feature-blind
```

Dependency direction is one-way and lint-enforced: actions → services →
repositories/providers → pure logic.

## Where the risk is

- **Tenancy.** Every dashboard query is owner-scoped in the WHERE clause.
- **Untrusted PDFs.** The magic number decides the type; size and page count are
  bounded before parsing.
- **Prompt injection.** Resume text travels inside an envelope the provider
  owns, never in the system instruction.
- **Published content.** Only `https:` and `mailto:` URLs render as links, and a
  URL that fails the check produces no anchor at all.
- **Cost.** Per-user quotas and a platform-wide ceiling, counted in Postgres.
