# 06 — Design system and accessibility

## Tokens, not colours

Semantic CSS custom properties (`--role-*`) map to Tailwind theme values. A
component asks for `text-foreground`, never for a hex value. Light, dark and
the accent palettes are the same token names with different values, which is why
a theme change is a stylesheet edit rather than a component sweep.

A tenant picks an accent by name, never a raw colour. Arbitrary user CSS is a
whole class of attacks; a fixed palette also guarantees the contrast ratios the
accessibility suite asserts.

## Class bundles

Raw `className` strings belong to `src/packages/ui-primitives`,
`src/shared/components/primitives`, and `*.variants.ts` / `*.constants.ts`
files. Everywhere else, import a bundle. The visual language stays reviewable in
one place instead of being reconstructed by grep.

## Copy

Every user-facing string comes from `src/packages/i18n/messages/en.json` by key.
Server and client resolve from the same catalog, so hydration cannot mismatch on
copy. A literal string in a component fails lint.

## Accessibility

WCAG 2.2 AA, checked two ways:

- **axe**, on every reachable page, in both themes, and at a 320px viewport.
- **A keyboard walkthrough**, for what axe cannot check: that the skip link is
  the first stop, that a portfolio can be created without a pointer, that
  sections reorder from the keyboard, and that the destructive confirmations are
  reachable.

Reordering is buttons, not drag-and-drop. Drag is nicer with a mouse and
unusable without one, and deciding what a reader sees first is not an optional
flourish.

Errors are announced through `role="alert"` and paired with an icon, so they are
never communicated by colour alone.
