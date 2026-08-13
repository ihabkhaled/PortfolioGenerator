export const adminAdminsClasses = {
  page: 'grid gap-8',
  header: 'grid gap-2',
  title: 'font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl',
  lead: 'max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty',

  formCard: 'grid gap-5 rounded-lg border border-border bg-surface-raised p-6',
  formHeader: 'grid gap-1.5',
  formTitle:
    'font-mono text-[0.6875rem] font-medium tracking-[0.16em] text-muted-foreground uppercase',
  formLead: 'text-sm text-muted-foreground',
  formGrid: 'grid gap-4 sm:grid-cols-2',
  formField: 'grid gap-1.5',
  formSubmit: 'w-fit sm:col-span-2',
  formSuccess: 'text-sm text-success-readable sm:col-span-2',
  formError: 'text-sm text-danger sm:col-span-2',

  toolbar: 'grid gap-3',
  resultCount: 'text-sm text-muted-foreground',

  tableWrap: 'overflow-x-auto rounded-lg border border-border bg-surface-raised',
  table: 'w-full min-w-[64rem] border-collapse text-start text-sm',
  th: 'border-b border-border px-4 py-3 text-start font-mono text-[0.6875rem] font-medium tracking-[0.1em] text-muted-foreground uppercase',
  td: 'border-b border-border px-4 py-4 align-middle text-foreground',
  tdName: 'font-medium whitespace-nowrap text-foreground',
  tdActions: 'flex flex-wrap items-center gap-2',
  nameCell: 'flex flex-wrap items-center gap-2',

  actionRow: 'flex flex-wrap items-center gap-2',
  actionConfirmText: 'text-xs text-muted-foreground',
  actionOutcome: 'w-full text-xs',
  actionOutcomeError: 'w-full text-xs text-danger',
} as const;
