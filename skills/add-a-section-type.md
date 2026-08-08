# Adding a section type

## When

A new kind of band on a portfolio page.

## Steps

1. Add the type to the section union in the document schema, with its own
   `config` shape. The union is discriminated on `type`, so the compiler will
   now list every place that needs updating — follow it.
2. Add the label key to `src/packages/i18n/messages/en.json` under
   `portfolio.sections`, and to `buildPortfolioLabels`.
3. Add a case to `SectionRenderer`. It assembles the view model; the leaf
   component receives finished strings.
4. Write the leaf component in `portfolio-renderer/components/`. Props in, TSX
   out. Class bundles from `template-style.constants.ts`.
5. Teach `hasContent` when the section has nothing to show, so it is skipped
   rather than rendered as a heading over emptiness.
6. Add it to the fixtures and to `src/tests/unit/renderer-sections.test.tsx`,
   with and without its optional parts.
7. `npm run schema:json`, then the suites.

## The step people forget

Step 5. A section that renders an empty band reads to a visitor as "the
extractor lost my data", which is the single worst impression this product can
give.
