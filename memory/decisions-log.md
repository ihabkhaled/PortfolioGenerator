# Decisions log

Append-only. Decisions too small for an ADR but too consequential to rediscover.

Newest last.

---

**2026-08-08 — Port 5433 for the development database.**
Port 5432 is occupied by another project's stack on the machine this was built
on. The value lives in `.env`, and `docs/testing.md` names it.

---

**2026-08-08 — Fixtures are shared between the unit suite, the E2E suite and
the seed.**
One synthetic person, defined once. A second fixture set would drift, and
"works locally" and "passes CI" would stop describing the same document.

---

**2026-08-08 — The extraction warning path is a dotted string, not a typed
accessor.**
`experience.0.startDate` is readable in a database row and survives schema
evolution without a migration. A typed accessor would be better checked and
worse to read during an incident.

---

**2026-08-09 — Route-segment config names are allowed by
`no-inline-declarations`.**
Next reads `dynamic`, `revalidate` and friends from the route module's own AST,
so importing them from a constants file would silently stop them applying. They
are a framework contract rather than configuration this repository chose to
embed.

---

**2026-08-09 — `/{slug}/opengraph-image` is a route handler, not the
`opengraph-image` file convention.**
The convention appends a content hash to the URL. The page's metadata is built
by hand, so the two would disagree and the share preview would 404. The path is
reserved in `PORTFOLIO_SUBPATH_SEGMENTS` so no tenant page can shadow it.

---

**2026-08-09 — Coverage scope narrowed, thresholds raised.**
See ADR-0007. The short version: a number that requires mocking the database to
achieve is not a measurement.

---

**2026-08-09 — Deleting a portfolio keeps its slug claimed.**
See ADR-0008. A published address is usually on someone's business cards.
