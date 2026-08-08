# ADR-0005 — An owned translator instead of next-intl at runtime

- **Status:** Accepted
- **Date:** 2026-08-09

## Context

next-intl was the initial choice for the message layer. On static prerender
it resolved to its `ENVIRONMENT_FALLBACK` path, producing keys instead of copy
on pages that are prerendered at build time.

The i18n _discipline_ — one catalog, keys not literals, a lint rule enforcing it
— was worth keeping regardless of the library.

## Decision

`packages/i18n` owns a small translator: a namespace lookup over one JSON
catalog, with interpolation, exposed as `useAppTranslation` (client) and
`getServerTranslations` (server, async).

The vendor boundary entry for next-intl stays, so reintroducing it is a
one-directory change if a real multi-locale requirement arrives.

## Consequences

- Server and client resolve from the same catalog, so hydration cannot mismatch
  on copy.
- `getServerTranslations` is async even though the lookup is synchronous:
  resolving a locale per request later becomes a real await without touching
  every call site.
- Pluralisation and date/number formatting are not implemented. When they are
  needed, that is the moment to reconsider the library rather than to grow this
  one.

## Alternatives considered

**Keep next-intl and work around the fallback.** Rejected: the workaround was
opting pages out of static generation, which is a page-performance decision
being made by a message library.

**Drop i18n entirely and use literals.** Rejected: it makes every user-facing
string a code change and removes the one lint rule that keeps copy reviewable.
