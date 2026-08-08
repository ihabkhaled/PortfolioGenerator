# Launch readiness

The checklist before the first real user. Every line is either automated — in
which case the command is named — or a human judgement that no test can make.

## Last full run

**2026-08-09**, against Node 24, PostgreSQL 17 and a production build.

| Gate                                             | Result                                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `format:check`                                   | clean                                                                                  |
| `lint` (`--max-warnings=0`) + severity check     | clean                                                                                  |
| `typecheck` — TypeScript 7.0.2 (app, test, node) | clean                                                                                  |
| `typecheck:compat` — TypeScript 6.0.3            | clean                                                                                  |
| `test`                                           | 746 passing, 33 files                                                                  |
| `test:coverage`                                  | 98.21% statements, 98.12% lines, 98.5% functions, 95.34% branches; pure layers at 100% |
| `build`                                          | 14 routes, production build                                                            |
| `quality:dead-code` (knip)                       | clean                                                                                  |
| `quality:circular` (dependency-cruiser)          | 385 modules, 1149 dependencies, no violations                                          |
| `security:audit`                                 | 0 vulnerabilities in production dependencies                                           |
| `test:e2e` + `test:a11y`                         | 37 passing                                                                             |

Two product bugs were found by that E2E run and fixed before it went green: the
first publish of every portfolio produced a page that 404'd, and the dashboard
index shipped without its `no-store` and `noindex` headers. Both are recorded in
[../memory/gotchas.md](../memory/gotchas.md).

The human-judgement sections below have **not** been signed off. They need a
person and a phone.

## Automated gates

```bash
npm run validate     # format check + lint + typecheck + coverage + build
                     # + dead code + circular deps + audit + E2E
```

- [ ] `npm run format:check` — no unformatted files
- [ ] `npm run lint` — zero errors, zero warnings, and the severity check passes
- [ ] `npm run typecheck` — TypeScript 7 across app, test and node projects, and
      the TypeScript 6 compatibility pass
- [ ] `npm run test:coverage` — pure layers at 100%, everything else at 95%
- [ ] `npm run build` — production build succeeds
- [ ] `npm run quality:dead-code` — knip reports no unused exports or files
- [ ] `npm run quality:circular` — dependency-cruiser reports no cycles
- [ ] `npm run security:audit` — no high or critical advisories in production
      dependencies
- [ ] `npm run test:e2e` — the golden path, the tenancy cases, the ingestion
      guards and the deletion lifecycle
- [ ] `npm run test:a11y` — WCAG 2.2 AA, both themes, 320px, keyboard

## Configuration

- [ ] `NEXT_PUBLIC_APP_URL` is the real origin. It is inlined at build time; a
      wrong value ships localhost URLs into the sitemap.
- [ ] `NEXT_PUBLIC_APP_ENV=production`, so `robots.txt` allows crawling.
- [ ] `BETTER_AUTH_SECRET` is 32+ random bytes and is not the example value.
- [ ] `STORAGE_DRIVER=s3` with a real bucket, and the bucket is **private**.
- [ ] The database is not reachable from the public internet.
- [ ] Quotas and the budget ceiling are set to numbers someone has thought about.
- [ ] `.env` is not committed. (`git ls-files | grep -c '^\.env$'` is 0.)

## Data

- [ ] No real person's CV is in the repository or the seed. Every fixture is
      invented.
- [ ] The development seed has not been run against the production database.
- [ ] A backup of the database has been taken and **restored somewhere**, so the
      restore path is known to work rather than assumed to.

## Behaviour, verified by hand

These are the things a person has to look at. See
[qa/manual-test-plan.md](./qa/manual-test-plan.md).

- [ ] A published portfolio looks right on a phone, a laptop and a wide monitor.
- [ ] It looks right in dark mode, and in the reader's own OS preference.
- [ ] A long name, a long headline and an RTL name do not break the layout.
- [ ] The share card renders and is legible at the size a social platform shows
      it.
- [ ] Someone unfamiliar with the product can get from the landing page to a
      published portfolio without help.

## Operations

- [ ] `/api/health` is wired to the load balancer.
- [ ] Someone knows how to run the retention job, and when.
- [ ] The runbooks in [operations.md](./operations.md) name a person, not a role
      that does not exist yet.
- [ ] There is a way for a user to report a problem that reaches a human.

## Deliberately not done

Listed so nobody discovers them at the worst moment:

- No email verification and no password reset flow.
- No custom domains.
- No team accounts.
- No scheduled retention job — it is a query someone runs.
- No OCR for scanned CVs; they are detected and reported instead.
