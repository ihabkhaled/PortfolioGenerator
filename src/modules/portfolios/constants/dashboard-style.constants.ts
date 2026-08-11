export const dashboardClasses = {
  page: 'mx-auto grid w-full max-w-5xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:px-10',
  header: 'grid gap-3 border-b border-border pb-8',
  title: 'font-display text-3xl font-bold tracking-[-0.025em] text-foreground sm:text-4xl',
  lead: 'max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty',

  listSection: 'grid gap-4',
  sectionTitle:
    'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-muted-foreground',
  list: 'divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface-raised',
  item: 'flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6',
  itemMain: 'grid min-w-0 gap-1',
  itemName: 'font-display truncate text-base font-semibold tracking-tight text-foreground',
  itemMeta: 'truncate font-mono text-[0.6875rem] text-muted-foreground',
  itemActions: 'flex shrink-0 flex-wrap items-center gap-2',

  createPanel: 'grid gap-5 rounded-lg border border-border bg-surface-raised px-6 py-6',
  createTitle: 'font-display text-lg font-semibold tracking-tight text-foreground',
  createLead: 'text-sm leading-relaxed text-muted-foreground text-pretty',
  form: 'grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-start',
  field: 'grid gap-1.5 sm:grid-rows-[auto_auto_1rem]',
  fieldHint: 'min-h-4 text-xs leading-4 text-muted-foreground',
  fieldHintPlaceholder: 'hidden min-h-4 sm:block',
  createSubmit: 'sm:mt-[1.625rem]',
  error: 'flex items-start gap-2 rounded-md border border-danger/40 bg-danger/8 px-3 py-2.5',
  errorText: 'text-sm text-danger',
} as const;
