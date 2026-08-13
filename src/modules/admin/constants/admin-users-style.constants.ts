export const adminUsersClasses = {
  page: 'grid gap-8',
  header: 'grid gap-2',
  title: 'font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl',
  lead: 'max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty',

  toolbar: 'grid gap-3',
  searchForm: 'flex flex-wrap items-end gap-3',
  searchField: 'grid min-w-56 flex-1 gap-1.5',
  resultCount: 'text-sm text-muted-foreground',

  tableWrap: 'overflow-x-auto rounded-lg border border-border bg-surface-raised',
  table: 'w-full min-w-[56rem] border-collapse text-start text-sm',
  th: 'border-b border-border px-4 py-3 text-start font-mono text-[0.6875rem] font-medium tracking-[0.1em] text-muted-foreground uppercase',
  td: 'border-b border-border px-4 py-4 align-middle text-foreground',
  tdName: 'font-medium whitespace-nowrap text-foreground',
  tdMuted: 'whitespace-nowrap text-muted-foreground',
  tdActions: 'flex flex-wrap items-center gap-2',
  detailLink:
    'font-medium text-primary-readable underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',

  pagination: 'flex flex-wrap items-center justify-between gap-3',
  paginationStatus: 'text-sm text-muted-foreground',
  paginationControls: 'flex items-center gap-2',
  paginationDisabled: 'pointer-events-none opacity-50',

  actionRow: 'flex flex-wrap items-center gap-2',
  actionConfirmText: 'text-xs text-muted-foreground',
  actionOutcome: 'w-full text-xs',
  actionOutcomeError: 'w-full text-xs text-danger',

  detailPage: 'grid gap-8',
  backLink:
    'inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',

  profileCard: 'grid gap-5 rounded-lg border border-border bg-surface-raised p-6',
  profileHeader: 'flex flex-wrap items-start justify-between gap-4',
  profileActions: 'flex flex-wrap items-center gap-2',
  definitionList: 'grid gap-2 text-sm sm:grid-cols-2',
  definitionRow: 'flex flex-wrap items-baseline justify-between gap-3 sm:justify-start',
  definitionTerm: 'text-muted-foreground sm:w-32 sm:shrink-0',
  definitionValue: 'font-medium text-foreground',

  section: 'grid gap-3',
  sectionTitle:
    'font-mono text-[0.6875rem] font-medium tracking-[0.16em] text-muted-foreground uppercase',
} as const;
