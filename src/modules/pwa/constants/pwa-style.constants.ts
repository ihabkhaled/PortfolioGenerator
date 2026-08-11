export const pwaClasses = {
  // Stacked 4.25rem above the viewport bottom so it clears the language
  // switcher's own card (`localization-style.constants`) below `lg:`, where
  // the two float in the same horizontal territory. At `lg:` and up this
  // banner's `max-w-md` centred column no longer reaches the switcher's
  // bottom-end corner, so it can drop to the switcher's own tight offset —
  // freeing the space that, on a short page like an auth form, is what
  // used to sit directly over the page's own controls.
  updateRegion:
    'fixed start-[max(1rem,env(safe-area-inset-left))] end-[max(1rem,env(safe-area-inset-right))] bottom-[calc(env(safe-area-inset-bottom)+4.25rem)] z-50 mx-auto max-w-md lg:bottom-[max(1rem,env(safe-area-inset-bottom))]',
} as const;
