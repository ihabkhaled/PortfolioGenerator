# Package boundaries

Every third-party vendor has exactly one owning directory under
`src/packages/`. This document is the human-readable twin of
`eslint/package-boundaries.config.mjs` — **update both together**, because the
lint rule is what makes the map true.

| Vendor                                               | Owner                                                         | Why it is wrapped                                                                                                                                          |
| ---------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `zod`                                                | `packages/zod`                                                | `parseSchema` returns a discriminated result instead of throwing, so validation failure is a value every caller must handle.                               |
| `@prisma/client`                                     | `packages/database`                                           | One lazily-created, globally memoized client. Next re-evaluates modules on hot reload, and a fresh `PrismaClient` per reload exhausts the pool in minutes. |
| `better-auth`                                        | `packages/auth`                                               | Auth libraries move fast and touch cookies, sessions and headers. One file knows the shape.                                                                |
| `ai`, `@ai-sdk/openai`                               | `packages/ai`                                                 | The fastest-moving dependency in the product. A breaking upgrade should be a one-file change.                                                              |
| `unpdf`                                              | `packages/pdf`                                                | Parsing untrusted PDFs is the highest-risk operation here; the blast radius is one directory.                                                              |
| `aws4fetch`                                          | `packages/object-store`                                       | Request signing, isolated from the storage policy that uses it.                                                                                            |
| `next-intl`                                          | `packages/i18n`                                               | Retained as a boundary even though the translator is now owned; see ADR-0005.                                                                              |
| `sonner`                                             | `packages/toast`                                              |                                                                                                                                                            |
| `lucide-react`                                       | `packages/icons`                                              | Icon sets get replaced. Call sites should not care.                                                                                                        |
| `react-hook-form`, `@hookform/resolvers`             | `packages/forms`                                              |                                                                                                                                                            |
| `clsx`, `tailwind-merge`, `class-variance-authority` | `packages/ui-primitives`                                      | The design-system toolchain, and the one place raw class strings are allowed.                                                                              |
| `next/link`                                          | `packages/link`                                               | Also the single sanctioned place a database-derived path is widened to `typedRoutes`' branded `Route`.                                                     |
| `next/image`                                         | `packages/image`                                              |                                                                                                                                                            |
| `next/navigation`                                    | `packages/navigation` (server) / `packages/navigation/client` | Split so a server component wanting a redirect does not pull a client-only API.                                                                            |
| `next/cache`                                         | `packages/cache`                                              | Tag invalidation is a correctness requirement here, not a performance detail.                                                                              |
| `next/og`                                            | `packages/og`                                                 | The heaviest per-request dependency in the repository.                                                                                                     |
| `next/font/*`                                        | `shared/fonts`                                                |                                                                                                                                                            |

## Packages with no vendor

`packages/env`, `packages/logger` and `packages/zod`'s helpers own a _concern_
rather than a dependency. The rule is the same: one place, everyone else imports
the facade.

## Adding a vendor

1. Create `src/packages/<name>/index.ts` (plus `server.ts` or `client.ts` if
   the split matters) and export the narrowest useful surface.
2. Add the entry to `eslint/package-boundaries.config.mjs`.
3. Add a row to the table above.
4. If the vendor must never reach the public render path, add its import
   specifier to `authoringOnlyDependencies` in `eslint/architecture.config.mjs`.
