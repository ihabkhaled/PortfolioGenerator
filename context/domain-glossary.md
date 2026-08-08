# Domain glossary

Words used precisely throughout the code. If a word here appears in a variable
name, it means this.

**Portfolio** — a row. Owns a slug, a draft document, and possibly a published
snapshot. A user may have several.

**PortfolioDocument** — the canonical content shape, defined by
`portfolioDocumentSchema`. Versioned by `schemaVersion`. The database stores it;
it does not define it.

**Draft** — the document a user is editing. Private. Always present.

**Published snapshot** — a separate column holding the document that is public.
Copied from the draft at publish time. Separate columns rather than a status
flag over one column, so there is no window in which a half-saved edit is live.

**Slug** — the globally unique first path segment of a public portfolio
(`/{slug}`). Claimed separately from publishing, because changing a URL and
making a page public are different decisions with different consequences.

**Page** — a section of a portfolio with its own path (`/{slug}/{pageSlug}`).
Exactly one page has an empty slug; that is the home page.

**Section** — one band of a page, of a fixed known type, with a `visible` flag
and an `order`. The array position is what a user manipulates; `order` is what
the renderer sorts by, and `moveSection` keeps them in agreement.

**Block** — the bounded vocabulary inside a _custom_ section: paragraph, bullet
list, stat list, links. There is no HTML path and no markdown-that-renders-HTML
path. Extending expressiveness means adding a block kind and a renderer for it.

**Upload** — a stored CV file plus the row describing it and its ingestion
state.

**Extraction** — the model's report of what a CV says. Looser than a document:
every field nullable, no ids. Becomes a document through the mapper.

**Warning** — a concern raised during import, anchored to the field it concerns.
Shown next to that field in the editor.

**Owner-scoped** — a function that takes an `ownerId` and constrains its query
by it. The default.

**Unscoped** — a deliberately tenant-free read, named with the suffix, confined
by lint to the public read path.

**Blocker** — a reason a portfolio cannot be published yet. Returned as a list
so the screen can show every one at once.
