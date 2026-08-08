# 05 — AI and untrusted input

## The contract

Resume text is **data**, never instruction. Model output is **a proposal**, never
a shape to trust.

## How that is enforced

**The envelope.** Resume text is passed inside a delimiter the model provider
owns, never concatenated into the system instruction. A CV that says "ignore all
previous instructions" arrives as content on a page, which is what it is.

**Nullable everywhere.** Every field of the extraction schema is nullable, so
the model always has a legal way to say "not present" and never has to choose
between guessing and failing validation. This is the mechanism behind the
no-invention rule, not a politeness in the prompt.

**Drop, do not guess.** The mapper turns extraction output into a document. An
unusable value becomes absent and produces a warning attached to the field it
concerns. A date it cannot read is dropped; it is never rounded to a year, and
never inferred from a neighbouring role.

**Warnings are surfaced, not logged.** The editor shows what the extractor was
unsure about, next to the field, in plain language — not as model reasoning and
not as a banner. These are the handful of values most worth a second look before
someone's name goes on them.

## Observability

One `ai_runs` row per model call, including failures, holding operation,
provider, model, status, token counts, latency, retry count and error code —
and deliberately no prompt text, no completion text and no secrets. Enough to
answer "what does a successful extraction cost and how often do we escalate"
without building a second, unmanaged copy of everyone's private data.

## Budget

Per-user daily quotas and a platform-wide hourly and daily ceiling, both counted
in Postgres. The ceiling exists because the failure mode of an AI feature is not
an outage, it is an invoice.
