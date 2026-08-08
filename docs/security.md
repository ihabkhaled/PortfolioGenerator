# Security

## Threat model

Who we are defending against, in the order they matter:

1. **A curious signed-in user** trying to read another tenant's portfolio,
   upload, or extraction.
2. **An anonymous visitor** trying to enumerate unpublished work.
3. **A malicious CV** — a PDF crafted to attack the parser, or text crafted to
   steer the model.
4. **A malicious portfolio** — content crafted to attack a _visitor_ of the
   published page.
5. **Cost abuse** — driving up the model bill.

## Controls

### Tenancy

Every dashboard query is owner-scoped in the WHERE clause. Server actions
resolve the owner before doing anything. A row belonging to someone else is
reported as not found. See [rules/04](../rules/04-security-and-tenancy.md).

### Enumeration

A draft, a deleted portfolio and a typo all produce 404. The OG image route
returns 404 for an unknown slug rather than a placeholder card, because a
placeholder confirms the slug exists.

### Malicious PDFs

The magic number decides the file type, not the browser's claim. Size and page
count are bounded before parsing. Encrypted PDFs are rejected. Parsing happens
inside `packages/pdf`, the only place the parser is imported, so the blast
radius of a parser vulnerability is one directory.

### Prompt injection

Resume text goes to the model inside an envelope the provider owns and is never
concatenated into the system instruction. The output schema is nullable
everywhere, so the model can always say "not present". The mapper drops what it
cannot use. The E2E suite carries a CV containing an instruction and asserts it
does not become a field.

### Malicious content on a published page

React escapes text. URLs are restricted to `https:` and `mailto:`, and a URL
that fails the check is not rendered as a link at all. Control characters are
stripped from stored text — they are the raw material for bidirectional-override
tricks that make a rendered name read as something other than what is stored.
JSON-LD escapes `<` so a `</script>` sequence inside published content cannot
close the tag early.

There is no HTML path, no markdown-that-renders-HTML path, and no user CSS.

### Headers

Per-request nonce-based CSP with `strict-dynamic`, `frame-ancestors 'none'`,
`object-src 'none'` and `connect-src 'self'`. Plus `nosniff`, `DENY` framing,
a referrer policy, a permissions policy, COOP and HSTS.

`connect-src 'self'` is the one worth naming: a hostile string that somehow
reached the DOM has nowhere to exfiltrate to.

### Secrets

`process.env` is read only inside `src/packages/env`. Server values sit behind
`import 'server-only'`, so importing them from a client component is a build
error. `ai_runs` records metadata and never prompt or completion text.

### Cost

Per-user daily import and AI quotas, a per-IP hourly upload limit, and a
platform-wide hourly and daily ceiling, all counted in Postgres. The failure mode
of an AI feature is not an outage; it is an invoice.

## Reporting

Security issues should go to the repository owner privately, not to a public
issue. There is no bug bounty.

## Known gaps

- **No email verification.** An account is usable immediately. Adding
  verification is a better-auth configuration change plus a mail provider.
- **No 2FA.** Same.
- **No CSRF token on server actions beyond the framework's own protection.**
  Next.js checks the Origin header for server actions; this product does not add
  a second mechanism.
- **Rate limiting is per-user and per-IP, not per-ASN.** A distributed attacker
  with many accounts and addresses is bounded only by the platform ceiling.
