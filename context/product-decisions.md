# Product decisions

What was considered and deliberately not built, so the next person does not have
to re-derive the reasoning — or, worse, quietly reverse it.

## Not built

**No template gallery.** One template, done properly, in a fixed palette. Three
half-finished templates is a worse product than one good one, and every template
multiplies the accessibility and RTL surface.

**No custom CSS or HTML.** A user composes from a bounded block vocabulary.
Arbitrary user CSS is a whole class of attacks and makes contrast guarantees
impossible.

**No autosave in the editor.** Explicit save. The editor has optimistic
concurrency, and "your changes could not be saved, someone edited this in
another tab" is an answerable message when the user just pressed a button and an
infuriating one when it appears on its own three seconds after they stopped
typing.

**No custom domains.** A real feature, and a real operational commitment
(certificate issuance, renewal, and a support queue). Out of scope until the
product has users who want it.

**No team accounts.** The tenancy model is one owner per portfolio. Adding
membership later is a schema change; pretending to support it now would be a
half-enforced authorization model, which is worse than none.

**No OCR by default.** A scanned CV is detected and reported rather than run
through OCR. OCR output is noticeably worse, and a portfolio built from a bad
transcription looks like carelessness by the person whose name is on it.

**No Redis.** The limits that matter are per-user-per-day import and AI quotas —
low-frequency writes already adjacent to a database transaction. A second
datastore would buy nothing and add an operational dependency. See ADR-0003.

## Built, and easy to mistake for over-engineering

**A migration chain with no migrations in it.** Published portfolios outlive
schema versions. The chain, and its tests, exist so that shipping version 2 is
adding one entry rather than designing a migration mechanism under time pressure
while published pages fail to render.

**An audit table.** Publishing, unpublishing, slug changes and deletions are the
events someone reads during an incident. The metadata is bounded scalars and
never CV text: an audit table that accumulates document bodies is a second,
unmanaged copy of everyone's private data.

**A deterministic AI provider.** Not a mock — a real, rule-based extractor that
runs offline. It makes the whole pipeline testable in CI without a paid call,
and it is the fallback if a provider is unavailable.

## Deliberately low bars

**Publish readiness.** A name, a headline, something on the page, and a
reachable home page. The temptation is to require a "complete" portfolio, but a
graduate with one job and three skills has a legitimate portfolio and a platform
that tells them otherwise is wrong.
