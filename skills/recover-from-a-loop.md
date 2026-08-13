# Recover from a loop

The operational form of
[`rules/09-executive-function.md`](../rules/09-executive-function.md). That
file argues the budgets; this one is what to do when one is hit.

Use this the moment a detector below fires — not after several more attempts
"just to be sure". Being sure is what the detector is for.

## The rabbit-hole detector

Any one of these firing is enough to stop and run the protocol:

- Three or more nested investigations open at once (an investigation inside
  an investigation inside the original task).
- The same file reread and nothing new was learned from it.
- The same command run again with no new input and no new hypothesis.
- The same error message appearing after a fix that was supposed to remove
  it.
- A change made, reverted, then remade in substantially the same form.
- Oscillating between two approaches without either being finished.
- Several cycles of activity with no requirement actually completed.
- Scope growing without the user having asked for the growth.
- Hedging language piling up in your own reasoning or output — "maybe",
  "alternatively", "one more concern", "we should also", "while we're at
  it".
- A critic producing only non-blocking findings, round after round.
- A verification step run again and returning the same evidence as before.

## Return-to-Objective protocol

Run these steps in order. Each one is a sentence, not an essay.

1. **Stop the current branch of work.** Do not finish "just this one more
   check" first — that is the loop asking for one more turn.
2. **Restate the Primary Objective.** One sentence, in the user's terms, not
   in terms of whatever you have been investigating for the last several
   steps.
3. **Restate the Definition of Done.** What observable fact makes this
   finished.
4. **List what is already complete.** Concretely — files changed, checks
   passed, requirements met.
5. **List what remains.** Only what the Definition of Done still requires.
6. **Name the actual blocker**, if there is one — the real, specific fact
   stopping completion. "I am not sure this is optimal" is not a blocker.
   "The test fixture has no field for X" is.
7. **Decide whether the current branch blocks anything on that list.** If
   yes, it is the next deliverable — finish it, plainly, without reopening
   the investigation that got you here. If no, it is `OPTIONAL` or
   `UNRELATED` (`rules/09-executive-function.md`): write one line recording
   it and return to the nearest real deliverable.

This protocol itself should take longer to read than to run. If running it
takes more than a few lines of output, that is the perfectionism failure
mode applied to recovery — cut it down.

## Deadlock vs. livelock

Both burn the same budget; they look different and break differently.

**Deadlock** — reasoning without acting. Circling the same decision,
weighing the same two options, generating more analysis without producing a
next action. Broken by: skip straight to step 2 of the protocol above and
force a one-sentence answer, even a provisional one. A provisional decision
that produces a next action beats a perfect decision that produces none.

**Livelock** — acting without progress. Commands run, files edited, tests
executed — constant motion, but the Definition of Done checklist has not
gained a checked item in several cycles. Broken by: step 4 of the protocol.
Naming what is _actually_ complete, out loud, is usually enough to reveal
that nothing on the list has moved, at which point step 6 forces the real
blocker into the open.

## Anti-repetition: same strategy, different spelling

Detect semantic repetition, not just identical commands. These are the same
strategy wearing different syntax:

- `npm test X`, `npm test -- X`, `npx vitest X`, `npx vitest run X`
- Rereading a file, then grepping a symbol inside it, then opening the file
  it's imported from — three moves, one non-move, if none of them changes
  what you believe.
- Asking "does this work" via a unit test, then again via a script, then
  again via a manual trace, when the first answer was already conclusive.

The test is not "is the command different" — it is "did this produce
information I did not already have". If not, it counts against
`MAX_SAME_STRATEGY_ATTEMPTS`, regardless of its exact spelling.

## Progress-audit checklist

Run this whenever it is unclear whether the last stretch of work helped:

- What changed, concretely, toward the user's stated outcome?
- What remains, per the Definition of Done?
- What is genuinely blocking — not merely undecided or imperfect?
- What activity in the last stretch was repeated or produced no new
  information?
- What is the single highest-value next action?

Answer in five lines or fewer. If the answer to the first question is
"nothing", that is the detector firing — go to the protocol above.
