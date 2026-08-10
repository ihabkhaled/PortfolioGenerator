# Deployment

## What this needs

| Dependency                    | Notes                                                    |
| ----------------------------- | -------------------------------------------------------- |
| Node.js 24+                   | `.nvmrc` and `.node-version` pin the version             |
| PostgreSQL 16+                | The only required datastore                              |
| S3-compatible object storage  | AWS S3, Cloudflare R2 or MinIO                           |
| An OpenAI-compatible endpoint | Optional; `deterministic` works without one              |
| ClamAV 1.4 service            | Required when production uploads are enabled             |
| SMTP relay                    | Required for verification, contact and password recovery |

No Redis or queue. Vercel Cron invokes the bounded asset-object deletion retry;
see [ADR-0003](../architecture/adrs/0003-postgres-rate-limiting.md) for why rate
limiting remains in PostgreSQL.

## Environment

Copy `.env.example` and fill it in. Every variable is validated once at boot by
`src/packages/env`; a bad value fails startup with a readable message instead of
failing at the first request that happens to need it.

The values that must be set for production, and what goes wrong if they are not:

| Variable                                              | If wrong                                                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                                 | Canonical URLs, the sitemap and OG images point at localhost. Inlined at build time — a rebuild is required to change it. |
| `NEXT_PUBLIC_APP_ENV`                                 | Anything other than `production` makes `robots.txt` disallow everything. That is deliberate for preview deployments.      |
| `DATABASE_URL`                                        | Boot failure.                                                                                                             |
| `BETTER_AUTH_SECRET`                                  | Boot failure below 32 characters. Rotating it invalidates every session.                                                  |
| `AUTH_REQUIRE_EMAIL_VERIFICATION=false` in production | Boot failure. Mandatory verification also requires enabled, fully configured SMTP delivery.                               |
| `STORAGE_DRIVER=s3` without the S3 block              | Boot failure, naming the missing variables.                                                                               |
| `AI_PROVIDER=openai-compatible` without `AI_API_KEY`  | Boot failure.                                                                                                             |
| `CRON_SECRET`                                         | Boot failure in production when absent or shorter than 32 characters.                                                     |
| `CLAMAV_ENABLED=false` in production                  | Uploads are stored unscanned. Not a boot failure — see below.                                                              |
| `CLAMAV_ENABLED=true` without reachable clamd         | Uploads fail closed; no unscanned bytes are stored.                                                                       |
| `AI_GOOGLE_API_KEY` absent                            | Translation returns `not-configured`. Extraction is unaffected.                                                           |
| `CONTACT_EMAIL_ENABLED=true` without the SMTP block   | Boot failure, naming the missing relay values.                                                                            |

Private portfolio pages cannot be listed as a `robots.txt` prefix because they
share the same slug namespace as public portfolios. They are excluded by
response-level `X-Robots-Tag: noindex, nofollow` and private no-store caching;
publishing their tenant-specific paths in `robots.txt` would itself leak them.

## Virus scanning is no longer a boot requirement

`CLAMAV_ENABLED=true` in production used to be enforced at startup. It is not
any more: a platform with no private network to reach `clamd` on could not
deploy at all, and a site that will not boot is not safer than one that boots
with scanning off. The guarantee that remains is the one that matters — when
scanning **is** on and the daemon cannot answer, the upload is refused and
nothing is stored. Running with it off is a recorded risk, not a silent one; it
is a launch-readiness checklist item.

## Translation

Translation of stored portfolio content is configured independently of
extraction. `AI_GOOGLE_API_KEY` alone decides it: set it and translation runs on
Google AI whatever `AI_PROVIDER` is, so a deployment can leave extraction
deterministic and still translate. Leave it empty and translation reports
`not-configured` rather than falling back to the extraction model — a portfolio
rewritten by a model nobody chose for the job is worse than one left in its
original language.

`AI_GOOGLE_TRANSLATE_URL` defaults to Gemini's OpenAI-compatible endpoint and
`AI_TRANSLATION_MODEL` to `gemini-2.5-flash`. Gemini goes through the existing
OpenAI-compatible AI boundary; do not install or import a Gemini SDK. All three
are runtime environment variables on Vercel and are not required while
`next build` imports route modules.

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

## Scheduled asset deletion retry

`vercel.json` invokes `GET /api/operations/asset-deletions` daily at 03:00 UTC.
A Vercel Hobby project may only schedule one run per day, so the cadence is a
plan limit, not a design choice — on Pro, shorten it to `*/15 * * * *` so a
failed deletion is retried within the quarter hour rather than the day.
Vercel supplies `Authorization: Bearer <CRON_SECRET>`; configure
`CRON_SECRET` to that value. The endpoint refuses missing or
incorrect credentials, processes at most 50 due tombstones, disables caching,
and returns only the number processed. It never returns object keys, asset ids,
or tenant data. Manual invocations use the same bearer header; never put the
secret in a query string.

## ClamAV smoke runbook

With the configured scanner reachable, run:

```bash
npm run smoke:clamav -- readiness
```

This sends one harmless probe and an EICAR canary directly to clamd, requires a
clean verdict followed by an infected verdict, and holds both payloads only in
memory. The command caps its socket timeout at five seconds.

To probe scanner outage detection, stop or firewall the configured clamd endpoint, then
run:

```bash
npm run smoke:clamav -- outage
```

This command proves only that the bounded scanner probe reports the endpoint
unavailable. It does not exercise the application upload path. Separately
confirm an application upload is refused and that no object-storage or database
row was created, then restore clamd and repeat the readiness command.

## Build and start

```bash
npm ci
npm run db:migrate:deploy
npm run build
npm run start
```

`npm run build` runs the TypeScript 7 typecheck first and refuses to build on a
type error.

## Production browser and Lighthouse proof

After one production build, run the repository-owned browser evidence. Playwright starts the
production server on port 3100 and writes failure artifacts and traces under `test-results/`. CI's
HTML reporter additionally writes `playwright-report/`; the local reporter is the terminal list:

```bash
npx playwright test src/tests/e2e/pwa.spec.ts src/tests/accessibility/responsive.spec.ts
```

Then run both Lighthouse CI profiles. Each profile checks the landing page and dense accessibility
guide three times against a production server, fails regressions against its checked-in thresholds,
and writes artifacts to `test-results/lighthouse/mobile/` or
`test-results/lighthouse/desktop/`:

```bash
npm run lighthouse:mobile
npm run lighthouse:desktop
# or both, sequentially
npm run lighthouse
```

The mobile performance floor is 85/100 and the desktop floor is 90/100. Accessibility,
best-practices and SEO each require 100/100. These are release thresholds, not recorded live scores;
do not claim production results until the commands have run against the final build and their
artifacts have been reviewed.

## Migrations

`prisma migrate deploy` is forward-only and safe to run repeatedly. Run it
before starting the new version, not after: the application expects the schema
it was built against.

There is no destructive migration in the history. If one becomes necessary,
split it — add the column, backfill, deploy, then remove the old column in a
later release — so a rollback never lands on a schema that has lost data.

## Health

`GET /api/health` returns 200 for `ok` and `degraded`, 503 for `down`. When email
verification is mandatory, the probe performs a bounded SMTP authentication and
QUIT without sending a message; an unreachable relay or rejected credentials make
the instance unready. Point the
load balancer at it. A failing object store is `degraded` and keeps serving:
published pages render from the database, and pulling instances would take the
site down to protect a feature nobody was using at that moment.

## Rollback

The application is stateless. Roll back by deploying the previous image.

The one thing to check first is whether the release included a migration. If it
did, confirm the previous version can read the new schema — additive migrations
always can, which is why the rule above exists.
