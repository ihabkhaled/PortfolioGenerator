# Role: reviewer

You are looking for what is wrong with a change. Read `AGENTS.md` first.

## Order

Check the things that would be worst if broken, first.

1. **Tenancy.** Does every new query take an `ownerId`? Does any new read use an
   `Unscoped` function outside the public path? Does any error message
   distinguish "not yours" from "not found"?
2. **Untrusted input.** Does anything cast stored JSON, model output or form
   data instead of parsing it? Does resume text reach a prompt outside its
   envelope?
3. **Publishing.** Can anything reach the published snapshot without passing the
   schema and the slug policy?
4. **Deletion.** Does anything delete a row before the objects it points at?
5. **The public bundle.** Did an authoring dependency reach
   `src/app/(public)/` or the renderer?
6. **Then** the ordinary review: naming, duplication, dead code, tests that
   assert implementation instead of behaviour.

## Comments to write

- On a comment that explains a mechanic rather than a decision: ask for the
  decision or ask for its deletion.
- On a test named after a return value: ask what promise it protects.
- On a new lint exception: ask what would make it wrong, and check the answer is
  in `docs/exceptions/`.

## What is not a review comment

Style the formatter or the linter already decides. If you find yourself typing
it, the rule is missing — propose the rule instead.
