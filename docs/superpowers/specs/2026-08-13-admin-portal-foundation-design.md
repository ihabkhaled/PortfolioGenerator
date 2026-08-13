# Admin portal — Foundation (Phase 1 of 3)

- **Status:** Draft, proceeding on standing autonomy ("keep until the very
  end" / "don't ask further questions" — session-wide instruction)
- **Date:** 2026-08-13
- **Scope of this document:** Phase 1 only — the pieces every later admin
  feature depends on. Phases 2 and 3 (listed at the end) are named but not
  designed here; each gets its own spec when it starts.

## Problem

ProFolio has no operator surface at all today. Every account is either "a
signed-in owner" or "an anonymous visitor" — there is no way for the person
running the platform to look up a user, see what they published, or act on
abuse/support requests without a raw database connection. This phase builds
the part of an admin portal that has to exist before any of that is possible:
a genuinely separate authentication system, a role/permission model, a
non-touchable super-admin account, and the audit trail that makes "an admin
did X to a user's account" a reviewable fact instead of an untracked write.

## Decisions

### 1. A second, fully isolated `better-auth` instance — not a role flag

Confirmed technically sound by reading `better-auth`'s actual type
definitions (`node_modules/@better-auth/core/dist/types/init-options.d.mts`):
`user`, `session`, `account`, and `verification` each accept a `modelName`
override, and the top-level config accepts `basePath` and
`advanced.cookiePrefix`. That's everything needed to run a second instance
against four brand-new Prisma models, with its own cookie and its own API
route prefix, while still getting the vendor's audited password hashing and
session handling instead of hand-rolled crypto.

New package: **`src/packages/admin-auth/`**, sibling to `src/packages/auth/`.
This is the same vendor as an existing package, which brushes against "one
vendor, one wrapper directory" — the exception is deliberate: the whole point
is that this instance must not share code paths, config, or failure modes
with the user-facing one, so a second directory is the isolation, not a
violation of the rule's intent.

New Prisma models (mirroring `User`/`Session`/`Account`/`Verification`
field-for-field where better-auth needs matching shape, `@@map`'d to their
own tables): `AdminUser`, `AdminSession`, `AdminAccount`, `AdminVerification`.
Zero foreign keys to `User`/`Session`/`Account`/`Verification` — the two
systems don't reference each other at all.

Cookie: `managawy.session_token` (vs. the user-facing
`better-auth.session_token`), `httpOnly`, `secure` in production,
`sameSite: 'strict'` (tighter than the user cookie's `'lax'`, since an admin
session never needs to survive a cross-site top-level navigation the way a
shared portfolio link does). Session lifetime: 12 hours with sliding
refresh, not the user session's 30 days — an admin console should force
re-auth on a human timescale.

### 2. Route: `/managawy`, not `/admin`

Per your instruction. `ROUTE_PATHS.managawy = '/managawy'` is what actually
reserves the slug — `RESERVED_SLUG_SEGMENTS`
(`src/modules/publishing/constants/slug.constants.ts`) derives from
`ROUTE_PATHS`, so adding it there is load-bearing, not cosmetic. Also added
by hand to `PLATFORM_ROUTE_SEGMENTS`
(`src/modules/localization/constants/locale.constants.ts`, deliberately not
derived) so the legacy-slug-redirect logic in `proxy.ts` never mistakes
`/managawy` for a portfolio slug guess. `robots.ts` gets an explicit
`disallow` entry. No locale rewrite applies to `/managawy` — the console is
English-only for now (see "Deliberately deferred" below).

`proxy.ts` gets a stricter CSP branch for `/managawy/*`: no AdSense
allowances, no PayPal allowances, `frame-ancestors 'none'` (already global),
nonce-based `script-src 'self'` only. Every response under `/managawy` also
carries `Cache-Control: private, no-store, max-age=0` and
`X-Robots-Tag: noindex, nofollow` unconditionally — mirroring the existing
`PRIVATE_DASHBOARD_HEADERS` pattern used for the owner-editor 404 case, but
applied to the entire route tree instead of one path shape.

Auth gating follows the codebase's existing two-layer pattern exactly
(`src/app/dashboard/layout.tsx` is the precedent): a `/managawy` layout
redirects to `/managawy/sign-in` when there's no valid admin session (UX), and
every server action independently re-checks the session and the specific
permission it needs (actual authorization) — the layout guard is not the
security boundary, same as today's dashboard.

### 3. RBAC: a fixed permission enum, role-seeded defaults, per-admin overrides

```prisma
enum AdminRole {
  SUPER_ADMIN
  ADMIN
  MODERATOR
  @@map("admin_role")
}

enum AdminPermission {
  USERS_VIEW
  USERS_SUSPEND
  USERS_RESET_PASSWORD
  PORTFOLIOS_VIEW
  PORTFOLIOS_SUSPEND
  PORTFOLIOS_DELETE
  PAGES_MODERATE
  ADMINS_MANAGE
  RBAC_MANAGE
  AUDIT_VIEW
  @@map("admin_permission")
}
```

`AdminUser.permissions AdminPermission[]` (native Postgres array) is the
_resolved_ list — set from `DEFAULT_ROLE_PERMISSIONS[role]` (a plain
TypeScript `Record`, not a DB table — defaults are code-reviewed policy, not
runtime data) at creation, and only ever overwritten wholesale by the RBAC
page (Phase 3). No merge-at-request-time logic, so "what can this admin do"
is always one array read, not a computation that can silently drift.

Defaults, matching exactly what you specified: `MODERATOR` gets
`USERS_VIEW, USERS_SUSPEND, USERS_RESET_PASSWORD, PORTFOLIOS_VIEW,
PORTFOLIOS_SUSPEND, PAGES_MODERATE`. `ADMIN` and `SUPER_ADMIN` get every
permission. The RBAC _page_ that lets a super admin edit these per admin is
Phase 3 — this phase seeds and enforces the defaults; it does not yet render
an editor for them.

**Super admin is authorization-layer non-touchable, not UI-hidden.**
`AdminUser.isSuperAdmin Boolean @default(false)` is a second, independent
flag — checked as `admin.isSuperAdmin || admin.permissions.includes(x)` for
"can this admin act," and checked as `if (target.isSuperAdmin) reject()` in
every action that would modify, suspend, or delete an admin account,
regardless of the _caller's_ own role. No code path — not the seed script,
not any future action — ever sets this flag to `true` except the one-time
seed described below, and nothing ever sets it to `false`. This is what
makes "non-touchable" a fact enforced on every write, not a button removed
from a menu.

### 4. Super-admin seeding — an idempotent script, not a `.sql` migration

Every migration in this repo today (`prisma/migrations/`) is pure DDL —
confirmed by grepping all nine `migration.sql` files for `INSERT`, zero
matches. That's not incidental: a raw SQL migration can't call
`better-auth`'s own password-hashing routine, and hashing a password anywhere
outside that routine (a hand-rolled bcrypt call, say) would mean the
admin-auth instance's own password verification and the seed's hash could
silently drift apart.

New script: **`support/seed-super-admin.mts`**, same shape and
`--env-file-if-exists`/`--experimental-strip-types` invocation style as the
existing `support/seed.mts`. Idempotency is `if (await adminUser.count({
isSuperAdmin: true }) > 0) { log('already seeded, no-op'); return; }` — not a
upsert-by-email, deliberately: this guarantees a later deploy can never reset
an already-seeded super admin's password just because the env var is still
set, which an upsert would risk. Reads `ADMIN_SEED_EMAIL` and
`ADMIN_SEED_PASSWORD` from env, creates the `AdminUser` row
(`isSuperAdmin: true`, `role: SUPER_ADMIN`, full permission array) plus its
paired `AdminAccount` row with the password hashed through
`getAdminAuth().api.signUpEmail`'s own internal hasher (calling the real
sign-up path server-side once, not reimplementing hashing).

Wired into `vercel-build` as `db:migrate:deploy && npm run db:seed:admin &&
npm run build` — runs on every production deploy, costs one indexed `COUNT`
query after the first successful run forever after.

### 5. Env vars

Following the exact established pattern (`.env.example` blank placeholder +
generation comment, `env.schema.ts` validation with `min(32)`, production-boot
failure if missing — same as `BETTER_AUTH_SECRET`):

```
# --- Admin portal -----------------------------------------------------------
# Separate signing secret for the isolated /managawy auth instance — must not
# equal BETTER_AUTH_SECRET. Generate: openssl rand -base64 48
ADMIN_AUTH_SECRET=
# Bootstrap super-admin account, read once by support/seed-super-admin.mts.
# Safe to leave set after the first deploy — the seed is a no-op once an
# AdminUser with isSuperAdmin=true already exists.
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=
```

No new email transport — admin-triggered emails (Phase 2's "reset a user's
password") reuse the existing `CONTACT_SMTP_*` relay and `EmailSender`
interface (`src/packages/email/`), adding one new method to that interface
the same minimal way `sendPasswordReset`/`sendEmailVerification` were added.

I'll generate real values for `ADMIN_AUTH_SECRET` and `ADMIN_SEED_PASSWORD`
directly into your local `.env` (not committed) once this spec is
implemented, with `ADMIN_SEED_EMAIL` defaulted to your account email unless
you tell me otherwise, and push the same three to Vercel's environment
variables via the CLI if it's available in this environment.

### 6. Login security hardening

- **Rate limiting:** reuses `src/modules/rate-limit`'s existing
  `RateLimiter`/`DatabaseRateLimiter` (the same Postgres-backed, no-Redis
  primitive already used for import/AI quotas — ADR-0003), bucketed on
  `ip + email`. Five failed attempts locks that bucket for 15 minutes.
- **2FA is mandatory, not optional**, using better-auth's own `twoFactor`
  plugin (present in `node_modules/better-auth/dist/plugins/two-factor`) —
  TOTP only, no SMS. First successful password login with no TOTP enrolled
  yet is held in a partial-auth state and redirected to a mandatory
  "set up your authenticator app" screen before a real session is issued.
  The seeded super admin enrolls on their first real login, same as every
  other admin created afterward.
- **Audit log:** new `AdminAuditEvent` model (`adminUserId`, `targetType`
  enum `USER | PORTFOLIO | ADMIN_USER`, `targetId`, `action` string, bounded
  `metadata Json`, `createdAt`) — separate from the existing `AuditEvent`
  table, which records _whose data changed_, not _who acted on it_; an admin
  action needs both. Every mutating admin action writes one row before
  returning success.

## Data model summary (Phase 1 additions only)

```prisma
enum AdminRole { SUPER_ADMIN  ADMIN  MODERATOR }
enum AdminPermission { USERS_VIEW USERS_SUSPEND USERS_RESET_PASSWORD
  PORTFOLIOS_VIEW PORTFOLIOS_SUSPEND PORTFOLIOS_DELETE PAGES_MODERATE
  ADMINS_MANAGE RBAC_MANAGE AUDIT_VIEW }
enum AdminUserStatus { ACTIVE  SUSPENDED }
enum AdminAuditTargetType { USER  PORTFOLIO  ADMIN_USER }

model AdminUser {
  id            String            @id
  name          String
  email         String            @unique
  emailVerified Boolean           @default(false)
  role          AdminRole
  permissions   AdminPermission[]
  isSuperAdmin  Boolean           @default(false)
  status        AdminUserStatus   @default(ACTIVE)
  twoFactorEnabled Boolean        @default(false)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt
  sessions      AdminSession[]
  accounts      AdminAccount[]
  auditEvents   AdminAuditEvent[]
}

model AdminSession { /* mirrors Session, FK to AdminUser */ }
model AdminAccount { /* mirrors Account, FK to AdminUser — holds the TOTP secret via better-auth's own two-factor table shape */ }
model AdminVerification { /* mirrors Verification, unscoped */ }

model AdminAuditEvent {
  id           String                @id @default(uuid())
  adminUserId  String
  targetType   AdminAuditTargetType
  targetId     String
  action       String
  metadata     Json                  @default("{}")
  createdAt    DateTime              @default(now())
  admin        AdminUser             @relation(fields: [adminUserId], references: [id], onDelete: Cascade)
}
```

Exact field lists for the better-auth-mirrored models will match
`User`/`Session`/`Account`/`Verification` field-for-field (per the "field
names are its contract" comment already in `schema.prisma`), plus the
`AdminUser`-only columns above.

## What this phase actually ships

- `/managawy/sign-in` — email + password + mandatory TOTP, rate-limited.
- `/managawy` — dashboard shell: nav with all sections (Users, Portfolios,
  Admins, RBAC, Audit Log) visible but only "Dashboard home" is a working
  page. Home shows a handful of read-only stats pulled from data that
  already exists — total users, total portfolios by status
  (draft/published/unpublished), signups in the last 30 days — nothing
  invented, nothing requiring new instrumentation.
- The seeded super admin, permission enforcement, and audit logging are all
  live and testable even though the pages that will _use_ them (user
  search, portfolio moderation) don't exist until Phase 2.
- A new `src/tests/e2e/managawy-and-privacy.spec.ts`, mirroring
  `tenancy-and-privacy.spec.ts`'s structure exactly: unauthenticated →
  redirect to sign-in, never a raw 403; a regular user's session (from
  `better-auth`'s cookie) has zero effect on `/managawy` (proves the
  isolation); every `/managawy` response carries `no-store`/`noindex`; rate
  limiting actually locks out after 5 attempts; and — since there is only
  ever one `isSuperAdmin: true` row — an admin holding `ADMINS_MANAGE`
  still cannot flip that flag or otherwise modify the super admin's row.

## Deliberately deferred (not in this phase)

- **Phase 2 — User & portfolio management:** search/browse/paginate,
  suspend/activate, admin-triggered password-reset email, delete portfolio,
  a user's detail view listing their portfolios (draft/published), page-level
  moderation within a portfolio (my read of "pages management" — flag if you
  meant something else).
- **Phase 3 — Admin/moderator management + RBAC UI:** inviting new
  admins/moderators, the visual permission editor, admin account list.
- **i18n for `/managawy`:** English-only for now — this is an operator
  console for you and people you personally invite, not public-facing;
  translating it is pure cost with no user-facing benefit yet.
- **IP allowlisting:** no fixed IP to allowlist against; 2FA + rate limiting
  covers the realistic threat model for now. Revisit if you get a static IP.

## Brainstormed additions for later phases (not committing to any of these — flag which ones you want)

- **Impersonation ("view as user")** for support debugging — flagged
  explicitly as high-risk: would need to be read-only, time-boxed, and
  audit-logged with its own `AdminAuditEvent` action, given
  `docs/retention-and-privacy.md`'s existing stance that owner data has
  exactly one reader path today. Worth having, worth being the most
  carefully designed piece if you want it.
- **Billing/subscription oversight** — surfacing `User.subscriptionStatus`/
  `trialEndsAt`/PayPal fields read-only in the user detail view; the data
  already exists, this is close to free.
- **System/cost observability** — `AiRun` already records cost, latency,
  provider, and failure mode per call with _no prompt text stored_ (by
  design); a simple aggregate view (spend per day, failure rate by provider)
  is real, already-collected data, not a new subsystem.
- **Abuse/rate-limit monitoring** — a read view over `RateLimitCounter`,
  showing which buckets are currently throttled.
- **Admin session management** — list/revoke your own or another admin's
  active `AdminSession` rows (useful once there's more than one admin).
- **CSV export** for user/portfolio lists — cheap once search/pagination
  exists, low priority for a solo operator.
- **Bulk actions** (bulk suspend, bulk export) — explicitly flagging as
  probably YAGNI for a single-operator tool; only worth it if the user base
  grows enough that one-at-a-time moderation becomes the bottleneck.

## Testing

Per `AGENTS.md`'s existing coverage split: pure logic (permission resolution,
the `isSuperAdmin` guard function, rate-limit bucket math) gets unit tests at
100%; actions/repositories/the admin-auth instance itself are excluded from
unit coverage and verified in the new E2E spec instead, matching how
`requireOwner()`/dashboard auth is tested today.

## Alternatives considered

**Role flag on the existing `User` table (Option B from the earlier
discussion).** Rejected per your explicit "completely separate" instruction
— confirmed technically inferior anyway: it would mean an admin account is a
row a portfolio owner could also be, sharing session/reset-flow code with
the public-facing surface that is exactly what "100% secure" is asking to
avoid.

**A fully dynamic, admin-defined custom-role system** (create arbitrary named
roles with arbitrary permission sets, not just three fixed roles). Rejected
as disproportionate: you asked for three named roles with sensible
defaults and a page to override individual permissions per admin — not a
role-builder. The fixed-enum-plus-per-admin-override design gets you "decide
who can do what" without the schema and UI complexity of arbitrary role
definitions, and can grow into that later if it's ever actually needed.

**Raw SQL migration for the super-admin seed.** Rejected: cannot correctly
call better-auth's password hasher from SQL, and re-implementing hashing
outside the vendor's own routine risks a hash-format mismatch between seed
time and login time.
