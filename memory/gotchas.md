# Gotchas

Each entry leads with the **symptom**, because that is what you will have when
you arrive here.

---

**Symptom:** `typescript-eslint` throws `Cannot read properties of undefined
(reading 'Intrinsic')`, or says it does not support TS 7.0.

**Cause:** it is running against `@typescript/native`.
**Fix:** both compilers are installed on purpose. `typescript` (6.x) is for the
tools, `@typescript/native` (7.x) for the app. See ADR-0004. Do not "fix" this
by removing one.

---

**Symptom:** Prettier reformats every `eslint/*.mjs` file to double quotes.

**Cause:** a file named `prettier.config.mjs` anywhere in the tree is picked up
as Prettier's own config.
**Fix:** the ESLint interop file is named `prettier-interop.config.mjs` for
exactly this reason. Do not rename it back.

---

**Symptom:** a security test asserting that `http://` URLs are rejected passes,
and then keeps passing after you break the code.

**Cause:** `sonarjs/no-clear-text-protocols` autofixed the fixture to
`https://`.
**Fix:** EXC-0005 disables it for the URL policy and its test. If you write
another test with a cleartext URL in it, it needs the same treatment — and check
the fixture actually still says `http` after `--fix`.

---

**Symptom:** the JSON-LD block in the rendered page contains a literal
`\u003c` that does nothing, or the escape has vanished.

**Cause:** `unicorn/prefer-string-raw` rewrote the escape into a raw string.
**Fix:** the rule is disabled. The escape is what stops a `</script>` sequence
inside published content from closing the tag early.

---

**Symptom:** `server-only` throws when a module is imported by a plain Node
script.

**Cause:** it is a build-time marker with no runtime meaning outside the bundler.
**Fix:** `support/server-only-stub.mjs` plus a mapping in the alias resolver;
the vitest setup mocks it the same way.

---

**Symptom:** a Prisma update clears a column you did not mention.

**Cause:** `exactOptionalPropertyTypes` makes an explicit `undefined` a value,
and Prisma reads it as "set to undefined" rather than "leave alone".
**Fix:** filter the payload —
`Object.fromEntries(Object.entries(update).filter(([, v]) => v !== undefined))`.

---

**Symptom:** `/dashboard` is missing its `Cache-Control: no-store` header while
`/dashboard/settings` has it.

**Cause:** `source: '/dashboard/:path*'` does not match the bare segment.
**Fix:** list both `/dashboard` and `/dashboard/:path*`. The E2E suite asserts
on the bare path because that is the one every user lands on.

---

**Symptom:** an E2E spec times out waiting for a link named "Edit" right after
creating a portfolio.

**Cause:** creating a portfolio redirects to its editor, not back to the
dashboard.
**Fix:** `createPortfolio` waits for `**/editor` and returns the URL.

---

**Symptom:** `next build` fails on a type error in a test file even though
`npm run typecheck:app` was clean.

**Cause:** `typecheck:app` uses `tsconfig.app.json`, which excludes tests. Next's
own check does not.
**Fix:** run `npm run typecheck` (all projects) before `npm run build`.

---

**Symptom:** next-intl renders message keys instead of copy on a prerendered
page.

**Cause:** it resolves to `ENVIRONMENT_FALLBACK` during static generation.
**Fix:** the translator is owned now; see ADR-0005.

---

**Symptom:** the dashboard says a portfolio is Published, and its public address
returns 404. A fresh server restart does not help.

**Cause:** `publishedVersion` was a nullable column and the publish write used
`{ increment: 1 }`. SQL arithmetic on NULL is NULL, so the _first_ publish left
the counter null — and the read mapper treats a null version as "not really
published".
**Fix:** the column defaults to 0 and is NOT NULL; zero means never published.
Found by the E2E suite, which is the entire argument for having one.
