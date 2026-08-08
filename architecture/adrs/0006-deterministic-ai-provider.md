# ADR-0006 — A deterministic extractor, not a mock

- **Status:** Accepted
- **Date:** 2026-08-09

## Context

CI must exercise the import pipeline end to end. It must not make a paid
model call: that is a bill nobody approved and a dependency on someone else's
uptime for a green build.

A test double would satisfy CI but would prove nothing about the pipeline, and
would leave the product with no answer when a provider is unavailable.

## Decision

`AI_PROVIDER=deterministic` selects a real, rule-based extractor that parses
CV text offline — sections, role lines, date ranges, contact details, skills —
and returns the same `ResumeExtractionResult` shape as the model provider,
warnings included.

It is the default in development, pinned in CI, and available in production as a
fallback.

## Consequences

- The full pipeline, including mapping, validation, warnings and the audit
  trail, is exercised on every commit with no network.
- The extractor is real code with its own tests, so it is held to the same
  standard as everything else — 100% coverage in the pure layers.
- It is worse than a good model at reading unusual CV layouts. That is fine: it
  is a floor, not a ceiling, and the warnings it emits are honest about what it
  could not read.

## Alternatives considered

**A mock provider returning a canned object.** Rejected: it asserts that the
mapper can map a fixture, which is a unit test, not an integration test.

**Recording and replaying real model responses.** Rejected: the recordings go
stale silently, and re-recording requires the paid call the policy is trying to
avoid.
