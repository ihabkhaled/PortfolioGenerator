# ADR-0001 — Portfolio content lives in JSONB, validated at runtime

- **Status:** Accepted
- **Date:** 2026-08-09

## Context

Portfolio content is deeply nested, user-reorderable, and read and written as
a unit. A relational model would be roughly a dozen tables (pages, sections,
section configs per type, experience, highlights, technologies, projects,
project links, skills, skill items, education, certifications, languages,
awards), joined on every read of a page that is always rendered whole.

The competing pressure is that JSON columns are opaque to the database: no
foreign keys, no column-level constraints, no schema evolution story for free.

## Decision

Content lives in a JSONB column. The canonical shape is
`portfolioDocumentSchema` in `src/modules/portfolio-document`, and **nothing
reads stored JSON without passing through it**.

The schema carries a `schemaVersion`, and migration runs before validation, so
a document written by an older build is upgraded and then checked rather than
defensively read with `?.` chains scattered through the renderer.

A JSON Schema artifact is generated from the Zod schema and snapshot-tested, so
a change to the contract shows up as a diff in a committed file rather than as a
surprise in production.

## Consequences

- Reading a portfolio is one indexed row read, which is what makes the public
  path cheap enough to be cache-friendly and dependency-free.
- Reordering a section is a document write, not a table of `order` columns to
  keep consistent.
- The database cannot enforce content invariants. The schema does, at every
  boundary, and the `no-cast` discipline is what makes that airtight rather
  than usual.
- A corrupt row is a 404, not a 500: `tryMigratePortfolioDocument` returns null
  and the route treats it as missing.

## Alternatives considered

**Relational tables.** Rejected: a dozen joins to render one page, and every
reorder becomes a multi-row transaction, in exchange for constraints that the
schema already enforces more precisely.

**JSONB with no runtime validation.** Rejected outright. That is a cast, and the
data comes from a model.
