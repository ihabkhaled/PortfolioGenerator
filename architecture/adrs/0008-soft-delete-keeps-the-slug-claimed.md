# ADR-0008 — Deleting a portfolio keeps its address claimed

- **Status:** Accepted
- **Date:** 2026-08-09

## Context

Deleting a published portfolio raises a question the product has to answer
deliberately: does the address become available again?

A published slug has usually been shared — on a CV, in an email signature, on a
business card. Releasing it makes it registrable by anyone.

## Decision

The portfolio row is soft-deleted: `deletedAt` is set, the status becomes
`UNPUBLISHED`, and the unique slug stays taken. The CV files and extracted text
are deleted from object storage immediately and the upload rows are soft-deleted
alongside.

Deleting an _account_ is a hard delete of the user row; the cascade removes the
portfolios, and with them the slugs.

## Consequences

- The address someone's business cards point at cannot be claimed by a
  stranger while the person who published it still exists.
- The bytes that matter — the uploaded CV and its extracted text — are gone
  immediately. What remains is a row with a slug and a document.
- A user who deletes a portfolio cannot immediately re-register the same slug on
  a new one. That is a real cost, and the right trade against impersonation.
- A retention job can hard-delete soft-deleted rows after a defined period; see
  `docs/retention-and-privacy.md`.

## Alternatives considered

**Hard delete, releasing the slug.** Rejected: it turns "I deleted my old
portfolio" into an opportunity for someone else to serve content at an address
that identifies the first person.

**Keep the files too.** Rejected: the file is the private thing. Keeping it
would make "delete" a lie about the only part the user actually cares about.
