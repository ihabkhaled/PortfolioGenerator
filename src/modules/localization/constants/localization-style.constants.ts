export const localizationClasses = {
  // `print:hidden`: `fixed` positioning is unreliable across paginated print
  // output (some browsers repeat a fixed element on every page), and a
  // language-switcher control has nothing to do once a page is printed —
  // including every page the portfolio PDF renderer captures (`page.pdf()`
  // uses print media by default).
  controls:
    'fixed end-[max(1rem,env(safe-area-inset-right))] bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-xl border border-border bg-surface-raised/95 p-2 shadow-lg backdrop-blur rtl:end-[max(1rem,env(safe-area-inset-left))] print:hidden',
  select: 'h-9 min-w-32 py-0',
  panel: 'grid gap-5 rounded-xl border border-border bg-surface-raised p-5',
  header: 'grid gap-1',
  title: 'font-display text-lg font-semibold text-foreground',
  hint: 'text-sm text-muted-foreground',
  form: 'flex flex-wrap items-end gap-3',
  field: 'grid min-w-48 flex-1 gap-1.5',
  list: 'grid gap-3',
  item: 'grid gap-3 rounded-lg border border-border p-4',
  itemHeader: 'flex flex-wrap items-center justify-between gap-2',
  itemTitle: 'font-medium text-foreground',
  preview: 'grid gap-1 text-sm text-muted-foreground',
  document: 'max-h-80 overflow-auto rounded-md bg-surface-sunken p-3 text-xs text-foreground',
  actions: 'flex flex-wrap gap-2',
  status: 'text-xs font-medium text-muted-foreground',
  error: 'text-sm text-danger',
} as const;
