# Deployment

## What this needs

| Dependency                    | Notes                                        |
| ----------------------------- | -------------------------------------------- |
| Node.js 24+                   | `.nvmrc` and `.node-version` pin the version |
| PostgreSQL 16+                | The only required datastore                  |
| S3-compatible object storage  | AWS S3, Cloudflare R2 or MinIO               |
| An OpenAI-compatible endpoint | Optional; `deterministic` works without one  |
| ClamAV 1.4 service            | Required when production uploads are enabled |
| SMTP relay                    | Required for contact and password recovery   |

No Redis, no queue, no cron. See [ADR-0003](../architecture/adrs/0003-postgres-rate-limiting.md).

## Environment

Copy `.env.example` and fill it in. Every variable is validated once at boot by
`src/packages/env`; a bad value fails startup with a readable message instead of
failing at the first request that happens to need it.

The values that must be set for production, and what goes wrong if they are not:

| Variable                                             | If wrong                                                                                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                                | Canonical URLs, the sitemap and OG images point at localhost. Inlined at build time — a rebuild is required to change it. |
| `NEXT_PUBLIC_APP_ENV`                                | Anything other than `production` makes `robots.txt` disallow everything. That is deliberate for preview deployments.      |
| `DATABASE_URL`                                       | Boot failure.                                                                                                             |
| `BETTER_AUTH_SECRET`                                 | Boot failure below 32 characters. Rotating it invalidates every session.                                                  |
| `STORAGE_DRIVER=s3` without the S3 block             | Boot failure, naming the missing variables.                                                                               |
| `AI_PROVIDER=openai-compatible` without `AI_API_KEY` | Boot failure.                                                                                                             |

Gemini uses the existing OpenAI-compatible AI boundary; do not install or import a
Gemini SDK. Set `AI_PROVIDER=openai-compatible`, `AI_BASE_URL` to
`https://generativelanguage.googleapis.com/v1beta/openai`, `AI_API_KEY` to the
Gemini API key, and optionally `AI_TRANSLATION_MODEL` to a translation-specific
Gemini model id. When omitted, translations use `AI_PRIMARY_MODEL`. These values
are runtime environment variables on Vercel and are not required while `next build`
imports route modules.
| `CLAMAV_ENABLED=true` without reachable clamd | Uploads fail closed; no unscanned bytes are stored. |
| `CONTACT_EMAIL_ENABLED=true` without the SMTP block | Boot failure, naming the missing relay values. |

The supported contact contract includes `CONTACT_EMAIL_PROVIDER=smtp`,
`CONTACT_RATE_LIMIT_MAX`, `CONTACT_RATE_LIMIT_WINDOW_MS`, and the
`CONTACT_SMTP_*` variables shown in `.env.example`. Port 587 with
`CONTACT_SMTP_SECURE=false` still upgrades with STARTTLS before credentials are
sent.

## Vercel and ClamAV

Deploy the Next.js application to Vercel and run ClamAV as a separate private
service using [`deploy/clamav/compose.yaml`](../deploy/clamav/compose.yaml).
Vercel Functions cannot host a long-running clamd daemon. The application must
reach it through a private-network connector or an authenticated TLS gateway;
never expose raw TCP port 3310 to the public internet because clamd provides no
authentication or transport encryption.

The deployment needs enough memory for signatures and scans (the supplied
container reserves 3 GB and limits at 4 GB), a persistent signatures volume,
and a health monitor. Copy `deploy/clamav/.env.example`, bind the gateway to its
private interface, then point `CLAMAV_HOST` and `CLAMAV_PORT` at that gateway.

Production secrets and endpoints remain human-owned steps: Vercel project
access, Postgres, object storage, SMTP credentials, Gemini/OpenAI-compatible AI
credentials, DNS, and the private scanner network cannot be provisioned from a
source checkout.

## Build and start

```bash
npm ci
npm run db:migrate:deploy
npm run build
npm run start
```

`npm run build` runs the TypeScript 7 typecheck first and refuses to build on a
type error.

## Migrations

`prisma migrate deploy` is forward-only and safe to run repeatedly. Run it
before starting the new version, not after: the application expects the schema
it was built against.

There is no destructive migration in the history. If one becomes necessary,
split it — add the column, backfill, deploy, then remove the old column in a
later release — so a rollback never lands on a schema that has lost data.

## Health

`GET /api/health` returns 200 for `ok` and `degraded`, 503 for `down`. Point the
load balancer at it. A failing object store is `degraded` and keeps serving:
published pages render from the database, and pulling instances would take the
site down to protect a feature nobody was using at that moment.

## Rollback

The application is stateless. Roll back by deploying the previous image.

The one thing to check first is whether the release included a migration. If it
did, confirm the previous version can read the new schema — additive migrations
always can, which is why the rule above exists.
