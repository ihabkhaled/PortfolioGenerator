# Changing the document schema

## When

Adding, removing or changing a field of `PortfolioDocument`.

This is the highest-stakes change in the repository: published portfolios that
already exist must keep rendering.

## Steps

1. Decide whether it is **additive**. A nullable new field is additive; a removed
   field, a renamed field or a narrowed type is not.
2. Edit `src/modules/portfolio-document/schemas/portfolio-document.schema.ts`.
   Required-and-nullable, not optional — a missing key and an empty value are the
   same fact to a reader.
3. Update `createEmptyPortfolioDocument` so new portfolios have the field.
4. Update the fixtures in `src/tests/fixtures/portfolio-document.fixtures.ts`.
   All three of them.
5. **If the change is not additive**, bump `PORTFOLIO_SCHEMA_VERSION` and add a
   step to `DOCUMENT_MIGRATION_STEPS`. The chain and its tests already exist for
   this moment; the step is a `{ from, to, upgrade }` object.
6. Regenerate the JSON Schema artifact: `npm run schema:json`. Commit the
   updated file — a change to the contract should show up as a diff someone
   reviews.
7. Update the mapper if the extractor can populate the field, and the renderer if
   it displays it.
8. `npm run test` and `npm run test:e2e`.

## The step people forget

Step 6. The snapshot test fails on the next run and the message points at the
snapshot rather than at the schema, which is confusing if you have moved on.
