# Operations

## What to watch

| Signal                                       | Where     | Means                                                                                                                                            |
| -------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/api/health` state                          | The probe | `degraded` = storage unreachable; `down` = database unreachable                                                                                  |
| `ai_runs` rows with `status != 'SUCCEEDED'`  | Database  | A rising `FAILED_VALIDATION` rate means the model is drifting and the prompt or schema needs work; `FAILED_PROVIDER` means someone else's outage |
| `ai_runs` count per hour                     | Database  | Compare against `BUDGET_MAX_AI_OPERATIONS_PER_HOUR`                                                                                              |
| `audit_events` of type `portfolio.published` | Database  | The product working                                                                                                                              |
| `rate_limit_counters` at their ceiling       | Database  | Either abuse or a limit set too low                                                                                                              |

## Useful queries

```sql
-- Extraction health over the last day.
SELECT status, count(*), round(avg(latency_ms)) AS avg_ms
FROM ai_runs
WHERE created_at > now() - interval '1 day'
GROUP BY status ORDER BY count DESC;

-- What the platform spent, by model.
SELECT model, count(*), sum(estimated_cost_minor) AS minor_units
FROM ai_runs
WHERE created_at > now() - interval '30 days' AND status = 'SUCCEEDED'
GROUP BY model;

-- Publish activity.
SELECT date_trunc('day', created_at) AS day, event_type, count(*)
FROM audit_events
WHERE event_type LIKE 'portfolio.%'
GROUP BY 1, 2 ORDER BY 1 DESC;

-- Objects that a deletion could not remove, and should be swept.
SELECT id, storage_key, extracted_text_storage_key
FROM resume_uploads
WHERE deleted_at IS NOT NULL;
```

## Runbooks

**The AI provider is failing.** Set `AI_PROVIDER=deterministic` and restart.
Imports keep working with a rule-based extractor; quality drops and the warnings
say so. Nothing else in the product is affected.

**Object storage is failing.** Health reports `degraded` and the probe still
returns 200, so instances stay in rotation and published pages keep serving.
Imports fail with a recorded audit event. Fix the bucket; nothing needs
replaying.

**A portfolio must be taken down urgently.** Unpublish it from the owner's
dashboard if you can reach them. Otherwise set `status = 'UNPUBLISHED'` and
`published_document = NULL` on the row; the cache tag expires within an hour and
can be forced sooner by a redeploy. Record why, in writing, outside the database.

**The budget ceiling is hit.** Every import fails fast with a specific message
rather than silently costing money. Raise `BUDGET_MAX_AI_OPERATIONS_PER_HOUR`
deliberately, or leave it and let the window pass.

**A slug needs to be released.** Deleting a portfolio keeps its slug claimed on
purpose ([ADR-0008](../architecture/adrs/0008-soft-delete-keeps-the-slug-claimed.md)).
Releasing one is a manual, deliberate act: delete the soft-deleted row after
confirming with the owner.

## Retention job

There is no scheduler in the product. The retention rules in
[retention-and-privacy.md](./retention-and-privacy.md) are enforced by a job you
run — a platform cron, a container, or a person with a psql session. It is
written that way because a silent, automatic deleter of user data is a thing you
want to be able to see and stop.
