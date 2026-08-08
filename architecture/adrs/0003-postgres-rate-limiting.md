# ADR-0003 — Rate limits and quotas are counted in Postgres, not Redis

- **Status:** Accepted
- **Date:** 2026-08-09

## Context

The product needs per-user daily import and AI quotas, a per-IP upload limit,
and a platform-wide budget ceiling. The reflex answer is Redis.

## Decision

Counters live in a `rate_limit_counters` table with a unique constraint on
`(bucket, windowStart)`, using clock-aligned fixed windows and an `expiresAt`
column for cleanup.

## Consequences

- One datastore to operate, back up and reason about.
- A quota check is already adjacent to a database transaction, so it costs
  nothing extra in round trips.
- Fixed windows allow a burst at a boundary. That is acceptable for limits
  measured in "five imports per day"; it would not be for an API gateway.
- If write volume ever makes this the bottleneck, the interface is narrow enough
  to put a different implementation behind.

## Alternatives considered

**Redis.** Rejected for now: it buys sliding windows and atomic increments the
product does not need, at the cost of an operational dependency and a new
failure mode — one where a Redis outage either blocks every upload or silently
disables every limit.

**In-memory counters.** Rejected: wrong the moment there are two instances, and
wrong in a way that only shows up under load.
