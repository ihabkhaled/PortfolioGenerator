export const adminAuditLogClasses = {
  page: 'grid gap-8',
  header: 'grid gap-2',
  title: 'font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl',
  lead: 'max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty',

  filters: 'flex flex-wrap items-end gap-4 rounded-lg border border-border bg-surface-raised p-5',
  filterField: 'grid min-w-48 gap-1.5',

  resultSummary: 'text-sm text-muted-foreground',

  tableWrapper: 'overflow-x-auto rounded-lg border border-border bg-surface-raised',
  table: 'w-full min-w-[920px] border-collapse text-sm',
  headCell:
    'border-b border-border px-4 py-3 text-start font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-muted-foreground',
  row: 'border-b border-border align-top last:border-0',
  cell: 'px-4 py-4 align-top text-foreground',
  whenText: 'font-mono text-xs text-muted-foreground',
  adminText: 'text-foreground',
  actionText: 'font-medium text-foreground',
  actionCode: 'block font-mono text-xs text-muted-foreground',
  targetTypeText: 'text-foreground',
  targetIdText: 'font-mono text-xs text-foreground',
  targetIdLink: 'font-mono text-xs text-primary-readable underline-offset-4 hover:underline',

  metadataEmpty: 'text-xs text-muted-foreground',
  metadataList: 'grid gap-1',
  metadataRow: 'flex flex-wrap gap-1 font-mono text-xs',
  metadataKey: 'text-muted-foreground',
  metadataValue: 'text-foreground',
} as const;
