# Runtime topology

What talks to what, and what each path costs.

## The public read path

```
visitor → /{slug}[/{pageSlug}]
        → cache (tag: portfolio:{slug})
        → one indexed Postgres read
        → render
```

No session lookup, no storage call, no AI. An anonymous request costs a cache
hit. The whole dependency set is Postgres plus the framework cache — which is
what makes "a published portfolio renders when everything else is down" true
rather than aspirational.

Publishing, unpublishing, slug changes and deletion invalidate the tag
explicitly, with read-your-own-writes semantics. That is a correctness
requirement: after a slug change the old address must stop serving immediately.

## The import path

```
user → server action (resolves owner)
     → validate bytes (magic number, size, page count)
     → object storage (private, server-generated key)
     → PDF text extraction
     → scanned/empty checks
     → per-user quota, then platform budget
     → AI provider (deterministic or OpenAI-compatible)
     → mapper → PortfolioDocument
     → draft saved, status NEEDS_REVIEW
```

Every step writes an audit event. Every model call writes an `ai_runs` row,
including failures.

## The publish path

```
user → server action (resolves owner)
     → re-validate the draft against the canonical schema
     → re-validate the slug against the reserved list
     → find blockers; refuse with all of them if any
     → copy draft → published columns in one transaction
     → invalidate the cache tag
     → audit event
```

Re-validating at publish time is deliberate: a document can be written by an
older build, and the thing about to become public is the one that must be
checked.

## Storage

Four operations — put, get, delete, exists. No listing, no public URLs, no
signed links. Two drivers: a local filesystem adapter for development and an
S3-compatible one for deployment, selected by configuration and validated at
boot.

## Failure modes

| If this is down | Then                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------- |
| Object storage  | Imports fail; published pages keep serving. Health reports `degraded`.                    |
| AI provider     | Imports fail at the extraction step with a recorded `ai_runs` row; everything else works. |
| Postgres        | Everything is down. Health reports `down` and the probe returns 503.                      |
