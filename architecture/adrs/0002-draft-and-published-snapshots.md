# ADR-0002 — Draft and published are separate columns

- **Status:** Accepted
- **Date:** 2026-08-09

## Context

A user edits a portfolio that may already be public. Something has to decide
what a visitor sees while an edit is in progress.

Three shapes were available: one document plus a status flag, two rows, or two
columns on one row.

## Decision

Two columns on one row: `draftDocument` and `publishedDocument`, with
`publishedVersion` and `publishedAt` beside them.

Publishing copies draft to published inside one transaction. Unpublishing clears
the published columns and leaves the draft untouched.

Draft writes carry the version the editor believed it was editing, and the write
is conditional on it. A stale save is rejected rather than silently winning.

## Consequences

- There is no window in which a half-saved edit is live.
- Unpublishing cannot lose work. Taking a page down is not a request to delete
  it, and conflating the two is how a support ticket becomes a data-loss
  incident.
- Two tabs cannot destroy each other's work; the second one is told, and is
  handed the server's current version so its retry can succeed.
- The public read never has to reason about draft state: it selects rows that
  are `PUBLISHED` and reads one column.

## Alternatives considered

**One column plus a status flag.** Rejected: publishing would mean the live
document _is_ the one being edited, so any save is instantly public.

**Two rows.** Rejected: it makes "the draft of this portfolio" a query rather
than a column, and introduces the possibility of a portfolio with two drafts or
none.
