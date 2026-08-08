export const feedbackClasses = {
  panel: 'grid gap-2 rounded-lg border border-dashed border-border bg-surface/50 px-6 py-10',
  errorPanel: 'grid gap-2 rounded-lg border border-danger/40 bg-danger/8 px-6 py-8',
  title: 'font-display text-base font-semibold tracking-tight text-foreground',
  description: 'max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty',
  actions: 'flex flex-wrap items-center gap-3 pt-3',
} as const;
