# 09 — Executive function

Canonical. Every agent file points here; none of them restate it.

Enforced by review, not by lint, because a lint rule cannot see whether an
agent is still working the user's problem or has quietly wandered into its
own. This rule is the check that a person — or another agent — runs instead.

It exists because the failure it prevents is not "wrong code". It is
plausible-looking activity that never converges: re-reading the same file,
retrying the same fix, arguing with a critic over style, or expanding a
one-line request into a redesign. None of that trips a build. All of it burns
the budget the user actually gave you.

## The pre-action gate

Before planning, auditing or editing, establish these seven things. If any is
unknown, find it out first — deep reasoning does not start before they exist.

1. **Primary Objective** — the outcome the user actually asked for, in one
   sentence.
2. **Success Condition** — the observable fact that proves the objective was
   met.
3. **Definition of Done** — the checklist that, fully checked, means stop.
4. **In Scope** — the files, systems or behaviour the objective touches.
5. **Out of Scope** — what looks related but is not required to answer the
   objective.
6. **Real Blockers** — what, if true, actually prevents finishing. Curiosity
   is not on this list.
7. **Next Deliverable** — the single next thing that moves the objective, not
   the single next thing that could be investigated.

This is a few seconds of thought, not a document. Its only job is to give
every later decision something to be measured against.

## The Primary Objective is immutable

A discovery made while working never silently redefines the request. If the
work surfaces something else — a bad abstraction, a missing test, a better
design — that is new information about the codebase, not a new objective.

**Worked example.** Asked to implement password reset, the agent finds the
existing Redis abstraction is awkward to extend. The abstraction is not
blocking the password-reset flow; it just offends taste. Correct move:
classify it `UNRELATED` (see below), write one line recording it as a
follow-up, and continue implementing password reset. Wrong move: pause to
redesign the Redis layer because it is now in view.

Wanting to fix something you noticed is not evidence that it needs fixing
now.

## Issue classification

Every discovery gets one label before it gets any attention:

| Label       | Meaning                                                          | May interrupt current work? |
| ----------- | ---------------------------------------------------------------- | --------------------------- |
| `BLOCKER`   | The stated objective cannot be completed without addressing this | Yes                         |
| `REQUIRED`  | The objective's own acceptance criteria demand it                | Yes                         |
| `OPTIONAL`  | Would improve the result but nothing asked for it                | No — record, continue       |
| `UNRELATED` | True regardless of this task; the codebase's, not this task's    | No — record, continue       |

Only `BLOCKER` and `REQUIRED` justify stopping the current deliverable.
Technical curiosity — "I wonder if", "this could be cleaner", "while I'm in
here" — is never a blocker by itself. If it will not stop the objective from
being met, it is `OPTIONAL` or `UNRELATED`, and the action is to write it
down, not to chase it.

## Budgets

Numeric limits exist because "use judgment" is exactly the instruction that
fails once an agent is already three levels deep in its own investigation and
no longer has the distance to judge.

| Budget                       | Value | Why this number                                                                                                                                                  |
| ---------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MAX_ACTIVE_NESTING_DEPTH`   | 3     | Objective → task → sub-task is normal work. A fourth level is investigating the investigation.                                                                   |
| `MAX_SAME_STRATEGY_ATTEMPTS` | 3     | One obvious fix, one revised diagnosis, one root-cause attempt. A fourth try with the same strategy is a loop, not persistence.                                  |
| `MAX_CRITIC_FIX_ROUNDS`      | 2     | A real defect is fixed on the first pass and confirmed on the second. A third round means the critic and the fixer are disagreeing about taste, not correctness. |
| `MAX_ACTIVE_WORK_ITEMS`      | 1     | Parallel half-finished threads are how scope drift hides — nothing is ever the thing you stop and check.                                                         |

Hitting a budget is not a failure. It is the signal to run the Return-to-
Objective protocol in
[`skills/recover-from-a-loop.md`](../skills/recover-from-a-loop.md) rather
than take one more swing.

## Retry semantics

A retry is not "try the same thing again and hope." Each attempt has a job:

1. **Attempt 1 — the obvious fix.** Apply the fix the symptom suggests.
2. **Attempt 2 — challenge the diagnosis.** If attempt 1 did not work, the
   first diagnosis was probably wrong, not the fix badly executed. Question
   the assumption, not the syntax.
3. **Attempt 3 — root-cause.** Trace the failure to its actual origin instead
   of its symptom, and fix that.

A fourth attempt using substantially the same strategy as a prior one is
forbidden — that is `MAX_SAME_STRATEGY_ATTEMPTS` being spent for nothing. A
retry that produces no new information is forbidden for the same reason:
running the same command again because the first result was inconvenient is
not verification, it is hoping.

Every failed attempt must be able to answer, before the next one starts:
which hypothesis just died, what new evidence appeared, and which assumption
changed as a result. If none of the three has an answer, the next step is not
another attempt — it is the loop-recovery protocol.

## Verification budget

Verification is necessary until the evidence is sufficient, and reassurance-
seeking after that. The line between them: once a check has produced a clear
answer, `VERIFIED = true` for that claim, and it stays true.

Re-verify only when one of these actually happened:

- New code changed the thing that was verified.
- The requirement itself changed.
- The earlier check is now known to have been incomplete (wrong environment,
  wrong inputs, a mocked path that hid the real one).

"I want to check it again" without one of those three reasons is compulsive
verification, not diligence. Re-running a green test suite because the
result feels too easy is spending budget on a feeling, not on information.

## Anti-perfectionism

Correct and complete beats theoretically perfect. The Definition of Done was
set before the work started; meeting it is success, not a starting point for
a better version.

A task is not an invitation to fix the repository. Everything found beyond
the objective goes through the classification above and, if `OPTIONAL` or
`UNRELATED`, gets written down — not implemented — unless the user asks for
it next.

## Priority order

When two goods conflict, this is the order that resolves it:

1. The user's stated objective
2. Correctness
3. Security
4. The task's explicit acceptance requirements
5. No regression to existing behaviour
6. Tests
7. Required gates (lint, typecheck, coverage, build)
8. Related maintainability
9. Optional improvements
10. Unrelated debt

Nothing below the objective ever displaces it. Nothing above "required
gates" is a reason to weaken one — see `AGENTS.md` §4: never weaken a gate to
make it pass. That non-negotiable sits above this ordering, not inside it.

## Definition of Done, and the stopping rule

Done means: the Success Condition holds, the Definition of Done checklist is
fully checked, and nothing in `BLOCKER` or `REQUIRED` remains open.

When that is true, stop. Successful completion is not permission to keep
looking for more work. An agent that finishes the objective and then goes
looking for something else to improve has left `MAX_ACTIVE_WORK_ITEMS` and
re-entered scope drift through the back door.

## Critic control

A critic — human or agent — may block completion only for:

- A correctness defect
- A security defect
- Violation of an explicit, stated requirement
- Data loss
- A breaking regression
- A failing required test

A critic may never block for style preference, speculative future
architecture, an optional refactor, or subjective elegance. Those are
`OPTIONAL` findings: worth recording, never worth another round. This is what
bounds `MAX_CRITIC_FIX_ROUNDS` at 2 — a legitimate defect is fixable in that
budget; a taste disagreement is not fixable by more rounds at all.

## Test scheduling

Running every gate after every edit is not thoroughness, it is `npm run
validate` doing the job attention should be doing. Schedule tests the way
this repository's own commands are laid out:

- **During implementation** — targeted checks: the unit test for the file
  just changed, `npm run typecheck:app` on the touched package.
- **At a checkpoint** — subsystem checks: the test file's whole suite, lint
  on the changed directory.
- **Once, at the end** — the full required gate for the work, matching
  `CLAUDE.md`'s notes (`npm run validate` needs Docker Postgres and
  Chromium; it runs before handing work over, not after every edit).

Gates are **scheduled** intelligently. They are never skipped and never
weakened to get a run to pass — that non-negotiable does not bend for this
rule or any other.

## The meta-rule

This framework exists to make agent work cheaper to finish, not more
elaborate to follow. If applying it takes longer than the loop it would have
prevented, it has failed at its own job.

- Run the pre-action gate once, in a sentence or two, not as a document.
- Do not produce a verbose self-report about following this rule — that is
  the "infinite refinement" failure mode applied to process instead of code.
- Load [`skills/recover-from-a-loop.md`](../skills/recover-from-a-loop.md)
  only when a warning sign in it actually fires. It is deep guidance for a
  rare state, not a checklist to run continuously.

Bootstrap once. Run cheap. Escalate only when a real signal fires.
