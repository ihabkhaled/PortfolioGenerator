# EXC-0009 — the image-crop field's raw `<img>`

**Rule:** `@next/next/no-img-element`
**Scope:** `src/modules/portfolio-editor/components/image-crop-field.component.tsx`

## Why the rule fires

The component renders a plain `<img>` instead of `next/image`, which the rule
flags because it bypasses Next's automatic optimization, lazy loading and
layout-shift prevention.

## Why it does not apply

The image being cropped is an in-memory `URL.createObjectURL` blob for a file
the visitor just picked in their own browser — it has no remote URL for
Next's image proxy to fetch or cache, and it is never served by this app.
The component also needs a real `<img>` DOM node for two things `next/image`
does not expose: reading `naturalWidth`/`naturalHeight` once the blob has
decoded, to compute the pan/zoom bounds, and passing that same node to
`canvas.drawImage` when the crop is applied. `next/image` also wants
`width`/`height` known before the image loads, which is exactly the
information this component is loading the image to discover.

## What would make this exception wrong

The preview ever loading from a real, cacheable URL instead of a local blob —
at that point `next/image`'s optimization would be worth having, and the
component would need to be restructured to read `naturalWidth`/`naturalHeight`
some other way (an `onLoad` callback rather than a stored ref, for instance).
