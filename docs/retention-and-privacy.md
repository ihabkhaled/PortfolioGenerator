# Retention and privacy

## What is stored

| Data                                    | Where                   | Why                                                     |
| --------------------------------------- | ----------------------- | ------------------------------------------------------- |
| Name, email, password hash              | `users`                 | Sign-in                                                 |
| Session token, IP, user agent           | `sessions`              | Sign-in                                                 |
| Portfolio draft and published documents | `portfolios` (JSONB)    | The product                                             |
| The uploaded CV file                    | Object storage, private | Re-running a review without re-uploading                |
| Extracted text                          | Object storage, private | The same                                                |
| Upload metadata, warnings               | `resume_uploads`        | Showing what the extractor was unsure about             |
| Model call metadata                     | `ai_runs`               | Cost and reliability. **No prompt or completion text.** |
| Publish/delete events                   | `audit_events`          | Bounded scalars only. **Never CV text.**                |
| Rate-limit counters                     | `rate_limit_counters`   | Quotas                                                  |

## What is not stored

- No analytics, no third-party trackers, no advertising identifiers.
- No prompt or completion text.
- No CV content in the audit log.
- No listing API, no public URLs and no signed links for stored files. The only
  reader is a server action that has already resolved the owner.

## Deleting a portfolio

Immediately:

- The published snapshot is cleared and the cache tag invalidated, so the public
  address stops serving.
- The uploaded CV files and extracted text are deleted from object storage.
- The upload rows are soft-deleted.

Retained:

- The portfolio row, soft-deleted, so the slug stays claimed. A published
  address is usually on a CV, an email signature or a business card, and
  releasing it makes it registrable by anyone. See
  [ADR-0008](../architecture/adrs/0008-soft-delete-keeps-the-slug-claimed.md).
- The audit events, with their bounded metadata.

## Deleting an account

- Every object belonging to the user is deleted from storage **first**. The
  cascade removes the upload rows, and with them the only record of which keys
  were theirs; doing it the other way strands the files.
- The user row is hard-deleted. Sessions, credentials, portfolios, uploads and
  AI runs cascade with it, and the slugs are released.
- Audit events survive with `owner_id` set to NULL: what happened stays
  readable, who it happened to does not. An append-only log that could be erased
  by the party it constrains is not a log.

The number of objects that could not be deleted is recorded on the audit event
rather than swallowed, so a sweep can finish the work.

## Scheduled retention

Configured by `RESUME_RETENTION_DAYS` (default 90). There is no scheduler in the
product — deliberately, because a silent automatic deleter of user data is a
thing you want to be able to see and stop. Run it as a platform cron:

```sql
-- Objects to remove, then rows. Take the keys first: deleting the rows first
-- strands the files.
SELECT storage_key, extracted_text_storage_key
FROM resume_uploads
WHERE created_at < now() - interval '90 days';

DELETE FROM resume_uploads WHERE created_at < now() - interval '90 days';

-- Portfolios soft-deleted long enough ago that the slug can be released.
DELETE FROM portfolios
WHERE deleted_at IS NOT NULL AND deleted_at < now() - interval '180 days';

-- Expired rate-limit counters.
DELETE FROM rate_limit_counters WHERE expires_at < now();
```

## Subject requests

**Access.** Everything the platform holds about a person is reachable from
`/dashboard/settings` and their portfolios. An export endpoint is not built; the
portfolio document is the data, and it is visible in the editor.

**Deletion.** Self-service, from the settings page, with a typed confirmation.

**Rectification.** The editor.
