/**
 * Inline styles rather than tokens: the global boundary can render when the
 * stylesheet itself failed to load, so it must not depend on it.
 */
export const globalErrorClasses = {
  body: 'min-h-dvh bg-white text-neutral-900',
  panel: 'mx-auto grid max-w-xl gap-4 px-6 py-24',
  title: 'text-3xl font-bold tracking-tight',
  lead: 'text-base leading-relaxed text-neutral-600',
  action:
    'w-fit rounded-md border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900 hover:bg-neutral-50',
} as const;
