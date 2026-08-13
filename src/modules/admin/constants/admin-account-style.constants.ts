export const adminAccountClasses = {
  page: 'mx-auto grid w-full max-w-3xl gap-5 px-6 py-10 sm:gap-6',
  header: 'grid gap-2 pb-1',
  title: 'font-display text-2xl font-bold tracking-tight text-foreground',
  lead: 'text-sm text-muted-foreground',
  section: 'grid gap-4 rounded-xl border border-border bg-surface-raised p-5',
  sectionTitle: 'font-display text-base font-semibold text-foreground',
  subsectionTitle: 'text-sm font-medium text-foreground',
  sectionHint: 'text-sm text-muted-foreground',
  field: 'grid gap-1.5',
  definitionList: 'grid gap-2 text-sm',
  definitionRow: 'flex flex-wrap items-baseline justify-between gap-3',
  definitionTerm: 'text-muted-foreground',
  definitionValue: 'font-medium text-foreground',
  permissionList: 'flex flex-wrap gap-2',
  permissionItem:
    'rounded-full border border-border bg-canvas px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground',
  error: 'flex items-start gap-2 text-sm text-danger',
} as const;
