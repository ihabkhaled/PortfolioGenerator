# 01 — App Router architecture

## The shape

```
src/app/        Routes. Thin.
src/modules/    Features. Layered.
src/packages/   Vendors. One each, behind a facade.
src/shared/     Generic. Feature-blind.
```

### Routes are thin

A route file resolves its params, calls one or two module surfaces, and renders.
It contains no business logic, no data shaping and no validation beyond deciding
which surface to call.

The reason is not tidiness. A route is the one file that cannot be unit-tested
without a framework harness, so anything that lives there is effectively covered
only by E2E. Keeping routes thin keeps the untestable surface small.

### Modules are layered, and the directory name is the layer

```
actions → services → repositories | providers → mappers | schemas | policies | helpers → types | constants
```

- **actions** — `'use server'`. The authorization boundary: resolve the owner,
  validate the input, delegate. A server action is a public HTTP endpoint with a
  friendly signature; "the page already checked" is not a check.
- **services** — use cases. React-free. Depend on repositories and providers.
- **repositories** — database access, owner-scoped.
- **providers** — infrastructure adapters: network, filesystem, SDK.
- **mappers / schemas / policies / helpers** — pure. Every function exported so
  a test can call it directly.
- **components** — props in, TSX out. No state, no fetching, no logic.
- **containers** — `'use client'`. State and events; call actions.
- **hooks** — `'use client'`. State orchestration; never touch the view layer.

The direction is one-way and enforced. A service that imports a container, or a
repository that calls a service, is a cycle waiting to become an import loop and
a layering violation that makes the code impossible to reason about in pieces.

### Surfaces

Each module exports through named files:

| Surface        | Contents                                           |
| -------------- | -------------------------------------------------- |
| `index.ts`     | Pure logic, constants, types. Safe anywhere.       |
| `server.ts`    | `import 'server-only'`. Services and repositories. |
| `<name>-ui.ts` | Components and containers.                         |

A deep import into another module's directories is an error. The surface is how
a module says what it supports; without it every internal file is public API and
nothing can be refactored.

The split matters for bundles, too: a client component importing a _type_ from a
module must not drag the Prisma client into the browser bundle, and separate
surfaces are what prevents it.

## Declarations

Implementation files do not declare module-level interfaces, enums or non-function
constants. Those live in `types/`, `enums/` and `constants/`.

Pure-logic files export every function they define. A private helper in a helper
file is a function no test can reach, which is how a 100%-covered file ends up
containing an untested branch.

Component files declare nothing beyond the component itself. Computation belongs
in the container or the hook, where it can be tested without rendering.

The one exception is Next.js route-segment config (`dynamic`, `revalidate`,
`runtime`, …). The framework reads those from the route module's own AST, so
importing them from a constants file would silently stop them applying.
