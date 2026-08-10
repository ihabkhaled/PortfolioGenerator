# EXC-0010 — the gallery lightbox's backdrop-click dismissal

**Rule:** `jsx-a11y/click-events-have-key-events`, `jsx-a11y/no-noninteractive-element-interactions`
**Scope:** `src/modules/portfolio-renderer/containers/gallery-lightbox.container.tsx`

## Why the rule fires

The `<dialog>` element has an `onClick` handler with no matching keyboard
handler, and jsx-a11y treats `<dialog>` as a non-interactive element that
should not have mouse/keyboard listeners attached directly.

## Why it does not apply

The handler closes the dialog when a click lands on the dialog's own padding
rather than a child (`event.currentTarget === event.target`) — the standard
React pattern for dismissing a native `<dialog>` by clicking its backdrop.
This is not the only way to close the dialog, and not a keyboard-inaccessible
one: Escape already closes a native `<dialog>` without any code in this file,
through the browser's own dialog-cancellation handling (wired up here via
`onCancel`). The click handler adds the equivalent mouse gesture to a
capability that already exists on the keyboard through a different path —
it does not gate access behind a mouse-only interaction.

## What would make this exception wrong

The dialog's Escape/`onCancel` handling being removed, or the click handler
being extended to do something Escape cannot also do — at that point the
click really would be the only way to reach that behavior, and would need a
genuine keyboard equivalent.
