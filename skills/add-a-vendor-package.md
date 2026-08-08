# Adding a vendor package

## When

Any new third-party runtime dependency. Not for dev tooling.

## Steps

1. `npm install <package>` — latest. This repository does not pin to old majors.
2. `src/packages/<name>/index.ts`. Export the narrowest useful surface, not the
   vendor's whole API. If the vendor has server-only and client-only halves,
   split into `server.ts` and `client.ts` so a client component cannot pull the
   server half.
3. Write the file comment: which vendor this owns, and _why_ it is wrapped.
   "Because the rule says so" is not a reason; "a breaking upgrade should be a
   one-file change" is.
4. Add the entry to `eslint/package-boundaries.config.mjs`.
5. Add the row to `context/package-boundaries.md`.
6. If it must never reach the public render path — anything AI, ingestion,
   editor, storage or auth — add its import specifier to
   `authoringOnlyDependencies` in `eslint/architecture.config.mjs`.
7. `npm run lint` to confirm the boundary is enforced, then use the facade.

## The step people forget

Step 6. The public render path is the one bundle anonymous visitors download,
and a dependency that sneaks in there is invisible until someone looks at the
bundle analyser.
