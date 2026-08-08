# architecture/

[adrs/](./adrs/) holds one file per decision that would be expensive to reverse.

An ADR is written when a choice constrains future work, not when a choice is
merely made. "We used a `for` loop" is not an ADR. "Portfolio content lives in
JSONB rather than in relational tables" is.

They are append-only. A decision that turns out to be wrong gets a new ADR that
supersedes it, and the old one keeps its record of what was believed at the
time.
