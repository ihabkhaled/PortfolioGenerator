# EXC-0006 — Reading a script body in a test

**Rules:** `testing-library/no-container`, `testing-library/no-node-access`
**Scope:** `src/tests/unit/portfolio-template.test.tsx`

## Why the rules fire

The test reaches into the container to read a
`<script type="application/ld+json">` element.

## Why they do not apply

A script body has no accessible role and no text node Testing Library will
return — its queries deliberately ignore script content. Asserting that the
JSON-LD payload reaches the page unescaped therefore requires reading the node
directly.

The alternative is asserting only the serializer in isolation, which leaves the
one place the escaping actually matters untested. The escaping is what stops a
`</script>` sequence inside published content from closing the tag early, so it
is worth a direct assertion.
