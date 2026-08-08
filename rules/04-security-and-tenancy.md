# 04 — Security and tenancy

## Tenancy

Every dashboard repository method takes `ownerId` as its first argument and puts
it in the WHERE clause. There is deliberately no `findById(id)`: that shape
invites "load now, check ownership later", which is how cross-tenant reads ship.

The two genuinely tenant-free lookups carry an `Unscoped` suffix, and
`no-unscoped-repository-access` confines them to the public read path, the
publishing module, the SEO module and the health probe.

**A row belonging to another tenant is reported as not found, never forbidden.**
Distinguishing the two tells a stranger the id exists.

## The public surface

Four things must be true for `/{slug}` to answer with anything but a 404, and
they are checked in this order: the portfolio exists, it is published, the page
exists, the page is visible. A draft and a typo produce the same response, so
the router cannot be used to enumerate unpublished work.

## URLs

Only `https:` and `mailto:` are publishable. A URL that fails the check is not
rendered as a link at all — not escaped, not stripped of its scheme, not shown
with a warning. Refusing to emit the anchor is the one behaviour that cannot be
worked around by a cleverly-encoded payload.

## Uploads

- The magic number decides whether a file is a PDF; the browser-reported MIME
  type does not.
- Object keys are generated server-side from crypto randomness. A user-supplied
  filename never becomes a path. The original name is kept in a column and only
  ever rendered as text.
- Storage exposes four operations and no listing, no public URLs and no signed
  links. Every one of those would be a way for a private CV to become reachable
  without passing an authorization check.

## Headers

A per-request nonce-based CSP with `strict-dynamic`, `frame-ancestors 'none'`
and `connect-src 'self'`. The last one matters more here than on a normal site:
a prompt-injected string that somehow reached the DOM still has nowhere to send
anything.

The dashboard additionally sends `Cache-Control: no-store` and
`X-Robots-Tag: noindex`.

## Secrets

`process.env` is read only inside `src/packages/env`. Server values live behind
`import 'server-only'`, which makes importing them from a client component a
build error rather than a code review question.
