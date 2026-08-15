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
| Redis                         | Optional — see below                                     |

No queue. Vercel Cron invokes the bounded asset-object deletion retry; see
[ADR-0003](../architecture/adrs/0003-postgres-rate-limiting.md) for why rate
limiting remains in PostgreSQL — the same "simplest infra that works"
reasoning is why the portfolio PDF download (below) generates in the request
path rather than through a message broker.

Redis is used for exactly one feature: caching a portfolio's downloadable PDF
and rotating its unguessable download link (`src/modules/portfolio-pdf`).
Nothing else in the product reads or writes it, and nothing else needs it —
rate limiting stays in Postgres. Unset `REDIS_URL` and that feature falls back
to an in-process cache: correct on a single instance, not durable across the
several a real deployment runs. Production should set it; the Vercel
Marketplace offers Upstash Redis as a one-click add-on that fills in
`REDIS_URL` automatically. Any `ioredis`-compatible `REDIS_URL` works — the
wrapper (`src/packages/redis`) is not tied to a vendor SDK.

## Environment

Copy `.env.example` and fill it in. Every variable is validated once at boot by
`src/packages/env`; a bad value fails startup with a readable message instead of
failing at the first request that happens to need it.

The values that must be set for production, and what goes wrong if they are not:

| Variable                                                     | If wrong                                                                                                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`                                        | Canonical URLs, the sitemap and OG images point at localhost. Inlined at build time — a rebuild is required to change it.                                            |
| `NEXT_PUBLIC_APP_ENV`                                        | Anything other than `production` makes `robots.txt` disallow everything. That is deliberate for preview deployments.                                                 |
| `DATABASE_URL`                                               | Boot failure.                                                                                                                                                        |
| `DATABASE_SSL_MODE`                                          | Defaults to `disable` locally; public production rejects anything except `verify-full`. The provider CA must be trusted and its hostname must match the certificate. |
| `BETTER_AUTH_SECRET`                                         | Boot failure below 32 characters. Rotating it invalidates every session.                                                                                             |
| `AUTH_REQUIRE_EMAIL_VERIFICATION=false` in production        | Boot failure. Mandatory verification also requires enabled, fully configured SMTP delivery.                                                                          |
| `NEXT_PUBLIC_APP_ENV=production` with `STORAGE_DRIVER=local` | Allowed, but Vercel stores it in temporary instance storage; uploaded files can disappear after scaling or deployment. Prefer a durable configured backend.          |
| `STORAGE_DRIVER=s3` without the S3 block                     | Boot failure, naming the missing variables.                                                                                                                          |
| `AI_PROVIDER=openai-compatible` without `AI_API_KEY`         | Boot failure.                                                                                                                                                        |
| `CRON_SECRET`                                                | Boot failure in production when absent or shorter than 32 characters.                                                                                                |
| `CLAMAV_ENABLED=false` in production                         | Uploads are stored unscanned. Not a boot failure — see below.                                                                                                        |
| `CLAMAV_ENABLED=true` without reachable clamd                | Uploads fail closed; no unscanned bytes are stored.                                                                                                                  |
| `AI_GOOGLE_API_KEY` absent                                   | Translation returns `not-configured`. Extraction is unaffected.                                                                                                      |
| `CONTACT_EMAIL_ENABLED=true` without the SMTP block          | Boot failure, naming the missing relay values.                                                                                                                       |
| `REDIS_URL` absent                                           | Not a boot failure. The PDF cache and download-token store fall back to an in-process implementation — see below.                                                    |
| `PDF_CHROMIUM_EXECUTABLE_PATH`                               | Escape hatch only; leave unset unless deploying Chromium somewhere neither `@playwright/test` nor `@sparticuz/chromium` reaches.                                     |
| Any one of the four PayPal values set without the rest       | Boot failure, naming the missing PayPal values. All four blank boots fine with billing off.                                                                          |

Private portfolio pages cannot be listed as a `robots.txt` prefix because they
share the same slug namespace as public portfolios. They are excluded by
response-level `X-Robots-Tag: noindex, nofollow` and private no-store caching;
publishing their tenant-specific paths in `robots.txt` would itself leak them.

The Prisma PostgreSQL adapter uses a pool of 1 on Vercel instances (10
elsewhere), with bounded idle and connection timeouts. A `P1017` connection
closure is not replayed automatically: an unknown outcome could duplicate a
mutation, and repository boundaries do not prove read-only intent universally.
Use the provider's server/transaction pooler URL as documented by that
provider; do not combine a pooler URL with a direct-database hostname or strip
its TLS parameters. The app removes only the URL's `sslmode` flag so the
validated `DATABASE_SSL_MODE` setting is authoritative.

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
runtime environment variables on Vercel, and these are not required while
`next build` imports route modules.

The supported contact contract includes `CONTACT_EMAIL_PROVIDER=smtp`,
`CONTACT_RATE_LIMIT_MAX`, `CONTACT_RATE_LIMIT_WINDOW_MS`, and the
`CONTACT_SMTP_*` variables shown in `.env.example`. Port 587 with
`CONTACT_SMTP_SECURE=false` still upgrades with STARTTLS before credentials are
sent.

## Portfolio PDF download

`GET /api/portfolio-pdf/download/{token}` renders a published portfolio's
public pages to a single PDF with headless Chromium (`playwright-core`),
caches the bytes for five days, and serves them only through a token that
rotates every eight hours — see `src/modules/portfolio-pdf` for the full
design and the ADR-style decision notes in
`services/portfolio-pdf.service.ts`.

Two things to verify after deploying, beyond setting `REDIS_URL`:

- **A Chromium binary must be reachable in production.** Locally and in CI
  this reuses the Chromium `@playwright/test` installs for the E2E suite; in
  production (`NODE_ENV=production`) it loads `@sparticuz/chromium`'s bundled
  build automatically. This has not been exercised against a real Vercel
  deployment as part of this change — download a PDF from a production build
  before relying on it, and set `PDF_CHROMIUM_EXECUTABLE_PATH` if the
  deployment target needs a different binary.
- **Function duration and memory.** The route sets `maxDuration = 60` and
  needs enough memory for one headless Chromium instance; confirm the Vercel
  plan and function configuration allow both. A cache hit (the common case
  after a portfolio's first download) returns in well under a second and
  never touches Chromium.

## PayPal billing

A published portfolio gets a 10-day free trial, starting the day the owner
first publishes anything. After that, keeping a portfolio public costs
`PAYMENT_PRICE`/month (flat, no tiers) through a PayPal subscription; if the
trial ends with no active subscription, the portfolio is unpublished — never
deleted — until the owner subscribes. See
[ADR-0009](../architecture/adrs/0009-paypal-subscription-billing.md) for why
billing is account-wide rather than per portfolio, and why deactivation reuses
the same code path as the owner's own unpublish button.

Billing is fully optional and off by default, the same "blank is disabled"
shape as translation's `AI_GOOGLE_API_KEY`: leave `PAYPAL_CLIENT_ID`,
`PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID` and `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
all blank and the app boots with the billing UI and the trial/deactivation
sweep both switched off. Set any one of the four and all four become
required at boot — see the table above.

### One manual step: registering the webhook

Everything else — the PayPal Product, the Plan, the subscription linking — is
handled by the application itself; see below. The one thing that cannot be
automated is registering this app's webhook URL with PayPal, because doing so
is what produces the id this app needs to verify inbound events:

1. In the [PayPal developer dashboard](https://developer.paypal.com/dashboard/applications),
   open the REST API app for this environment (sandbox or live) and note its
   **Client ID** and **Secret** — these become `PAYPAL_CLIENT_ID` /
   `PAYPAL_CLIENT_SECRET` (and `PAYPAL_CLIENT_ID` again as
   `NEXT_PUBLIC_PAYPAL_CLIENT_ID`).
2. Add a webhook pointed at
   `https://<your-deployed-domain>/api/payments/webhooks/paypal`, subscribed
   to at least: `BILLING.SUBSCRIPTION.ACTIVATED`,
   `BILLING.SUBSCRIPTION.CANCELLED`, `BILLING.SUBSCRIPTION.SUSPENDED`,
   `BILLING.SUBSCRIPTION.EXPIRED`, `PAYMENT.SALE.COMPLETED`,
   `PAYMENT.SALE.DENIED`, `PAYMENT.SALE.REFUNDED`.
3. PayPal responds with a webhook id (`WH-...`) for that registration. **This
   id, not the URL from step 2, is `PAYPAL_WEBHOOK_ID`.** It is what
   `verifyPaypalWebhookSignature` sends to PayPal's
   `/v1/notifications/verify-webhook-signature` endpoint to confirm an inbound
   POST actually came from PayPal; see the comment on `PAYPAL_WEBHOOK_ID` in
   `env.schema.ts` for the full distinction.

Nothing else is a manual step. The PayPal Product and the monthly Plan
(`PAYMENT_PRICE`, one currency, no tiers) are created automatically the first
time any request needs them — `getOrCreateSubscriptionPlan` checks a
one-row database table first and only calls the PayPal API on a cold start
with no row yet, so this costs a PayPal round trip once, ever, not on every
page render.

### Scheduled trial-expiry deactivation

`vercel.json` invokes `GET /api/operations/billing-deactivations` daily at
04:00 UTC, alongside the existing asset-deletion cron at 03:00 UTC — Vercel
Hobby allows up to two scheduled functions, each at most once a day, so this
is a second job rather than folded into the first. It authenticates the same
way (`Authorization: Bearer <CRON_SECRET>`), disables caching, processes at
most `BILLING_DEACTIVATION_BATCH_SIZE` (50) owners whose trial has ended
without an active subscription, and returns only how many portfolios it
unpublished — never which ones or whose.

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
