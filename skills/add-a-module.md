# Adding a module

## When

A feature area with its own vocabulary, its own data access, or its own screens.
If it is one function, it belongs in an existing module.

## Steps

1. `src/modules/<name>/` with only the layer directories you actually need. Do
   not scaffold empty ones.
2. `types/` and `constants/` first. Writing the shapes down before the logic is
   how you find out the feature is two features.
3. Pure logic next — `policies/`, `helpers/`, `mappers/`, `schemas/`. Export
   every function; the coverage gate holds this layer at 100% and cannot reach a
   private one.
4. `repositories/` if it owns rows. Every method takes `ownerId` first.
5. `services/` for the use cases. React-free.
6. `actions/` for the boundary: `'use server'`, resolve the owner, validate,
   delegate.
7. `components/` and `containers/` if it has a UI.
8. Surfaces:
   - `index.ts` — pure logic, constants, types.
   - `server.ts` — `import 'server-only'` at the top, then services and
     repositories.
   - `<name>-ui.ts` — components and containers, if any.
9. **If you added a UI surface, add its name to the `surfaces` list in
   `eslint/architecture.config.mjs`.** Otherwise every import of it is a
   deep-import error.
10. Tests. Then `npm run lint && npm run typecheck:app && npm run test`.

## The step people forget

The surfaces list in the ESLint config. The error message when you forget is
about deep imports, which sends people looking in the wrong place.
