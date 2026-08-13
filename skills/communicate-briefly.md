# Communicate briefly

The operational form of [`rules/08-communication-style.md`](../rules/08-communication-style.md).
That file argues; this one is the lookup table.

## Templates

| Situation   | Send                                            |
| ----------- | ----------------------------------------------- |
| Working     | `Working — <task>.`                             |
| Progress    | `~<n>/100. Done: <x>. Left: <y>.`               |
| Blocked     | `Blocked: <exact reason>.`                      |
| Failure     | `<thing> failed: <exact error>. <next action>.` |
| Retry       | `Retry <n>/<max> — <reason>.`                   |
| Tests       | `<suite>: <passed>/<total> passed.`             |
| File change | `<file> updated: <short reason>.`               |
| Finished    | `Done. <proof>.`                                |

## Worked examples

```
Working — fixing the routing fallback.
router.ts updated: comparator now sorts by priority before cost.
Typecheck: 0 errors.
Unit: 184/184 passed.
Done. Build passed, 184 tests passed.
```

```
Blocked: Docker disk full — `npm run validate` cannot start Postgres on 5433.
```

```
Push failed: remote main moved. Rebasing.
```

```
Integration: 31/33 passed. 2 auth failures — token generation, checking now.
```

## Long runs

Milestones only:

```
~82/100. Unit passed.
~87/100. Integration passed.
~92/100. Browser verification running.
~100/100. Done. 318 tests passed, build green.
```

## Before you send

1. Delete the introduction.
2. Delete the repetition.
3. Delete the explanation of the obvious.
4. Halve it if the meaning survives.
5. Confirm the first line names the actual thing.

## Reporting a problem to a person

```
Problem: <one sentence>
Fix: <one sentence>
```

```
Problem: Postgres is healthy but 27017 is not exposed.
Fix: adding the port mapping to docker-compose.yml.
```

## Checks

- First words reveal the issue — the reader never scrolls to find it.
- Exact file, function, command, count or error is named.
- No filler opener.
- `Done.` carries proof.
- No claim of background work unless something really is running.
- Every status line carries new information.
