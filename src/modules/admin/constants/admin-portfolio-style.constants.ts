import { buttonVariants } from '@/packages/ui-primitives';

export const adminPortfolioClasses = {
  page: 'grid gap-8',
  header: 'grid gap-2',
  title: 'font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl',
  lead: 'max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty',

  filters: 'flex flex-wrap items-end gap-4 rounded-lg border border-border bg-surface-raised p-5',
  filterField: 'grid min-w-48 gap-1.5',

  resultSummary: 'text-sm text-muted-foreground',

  tableWrapper: 'overflow-x-auto rounded-lg border border-border bg-surface-raised',
  table: 'w-full min-w-[760px] border-collapse text-sm',
  headCell:
    'border-b border-border px-4 py-3 text-start font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-muted-foreground',
  row: 'border-b border-border last:border-0',
  cell: 'px-4 py-4 align-middle text-foreground',
  slugLink: 'font-medium text-primary-readable underline-offset-4 hover:underline',
  ownerLink: 'text-foreground underline-offset-4 hover:underline',
  updatedText: 'font-mono text-xs text-muted-foreground',
  actionsCell: 'px-4 py-4 align-middle',

  actionForm: 'flex flex-wrap items-center gap-2',
  confirmHint: 'text-xs text-muted-foreground',
  actionError: 'w-full text-xs text-danger',

  pagination: 'flex flex-wrap items-center justify-between gap-3',
  paginationSummary: 'text-sm text-muted-foreground',
  paginationControls: 'flex items-center gap-2',
  paginationLink: buttonVariants({ variant: 'secondary', size: 'sm' }),
  paginationDisabled:
    'cursor-not-allowed rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground/50',
} as const;
