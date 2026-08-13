# 08 — Communication style

Canonical. Every agent file points here; none of them restate it.

Enforced by review, not by lint. It is a rule because a wall of text about a
failing build costs more to read than the build log it is summarising.

## The rule

Short. Direct. Concrete. Visible.

Default response: **1–5 short lines.** Write more only when the content
genuinely needs it — a design trade-off, a security decision, a report the
reader asked for.

## Name the actual thing

Every message states the exact file, function, command, test, error, count or
blocker.

| Instead of                          | Write                                                   |
| ----------------------------------- | ------------------------------------------------------- |
| "Something went wrong"              | `auth.service.ts:41 — refreshToken() returns 401.`      |
| "Some tests failed"                 | `4 failures in auth.spec.ts.`                           |
| "There seems to be an issue"        | `Cause: tokenVersion is stale after a password change.` |
| "Progress is going well"            | `~63/100. Done: router + DB. Left: UI + tests.`         |
| "I am investigating several things" | `Checking whether the proxy rewrites the Host header.`  |

## Plain words

`DB connection failed.` — not `The persistence layer appears unable to
establish connectivity.`

Write for a developer who wants the answer in five seconds.

## Cut before sending

Write it, then delete the introduction, the repetition, the restatement, and
the explanation of the obvious. If the meaning survives at half the length,
send the half.

Never open with: `Great question`, `Certainly`, `Let me explain`, `Let's dive
in`, `As you can see`, `It is worth noting`, `To summarise what I just said`,
`There are several factors`.

Start with the information.

## Status

| Situation | Format                                        |
| --------- | --------------------------------------------- |
| Working   | `Working — <task>.`                           |
| Progress  | `~<n>/100. Done: <x>. Left: <y>.`             |
| Blocked   | `Blocked: <exact reason>.`                    |
| Failure   | `<thing> failed: <exact error>. <next step>.` |
| Retry     | `Retry <n>/<max> — <reason>.`                 |
| Tests     | `<suite>: <passed>/<total> passed.`           |
| File      | `<file> updated: <short reason>.`             |
| Finished  | `Done. <proof>.`                              |

A blocker starts with the word `Blocked:` and states the reason in at most two
lines. The reader must never scroll to find out what stopped the work.

## Progress is an estimate, and it is real

`~42/100` is honest. `42/100` implies a precision that does not exist. Progress
covers investigation, implementation, tests and verification — not lines
written.

Every update carries new information. `Still working.` is not an update;
`Working — fixing 2 failing routing tests.` is.

## Visible execution

Prefer foreground execution. Emit one short line per meaningful atomic action —
file read, file changed, command run, test result, retry, defect found, defect
fixed. Not per token, not per character.

Maximum visibility, minimum noise.

## No fake background work

Never claim work is "running in the background", "continuing", or "processing"
unless the platform genuinely runs it asynchronously and will report back. If
nothing is running, say nothing is running.

## No unproven "done"

`Done.` requires evidence in the same line: a passing suite, a green build, a
verified request, a checked browser flow.

`Done. Build passed, 318 tests passed.` — not `Done.`

## Assertive when the evidence is

State a known cause as fact: `The bug is in the comparator — sort() orders by
cost before priority.`

State a suspicion as a suspicion: `Likely a Redis race. Verifying now.`

Hedging a certainty wastes the reader's attention. Asserting a guess costs them
a wrong fix.

## Answer four questions

When something is wrong: what is wrong, where, why, and what you are doing
about it. In that order, in as few words as carry it.

## Do not re-explain

Established context is established. `Using the existing routing-service
pattern.` is enough.

Skip meta-commentary on how hard, complex or careful the work is.
