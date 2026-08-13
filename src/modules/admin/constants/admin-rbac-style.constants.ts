export const adminRbacClasses = {
  page: 'grid gap-10',
  header: 'grid gap-2',
  title: 'font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl',
  lead: 'max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty',

  section: 'grid gap-4',
  sectionHeader: 'grid gap-1.5',
  sectionTitle: 'font-display text-lg font-semibold text-foreground',
  sectionHint: 'max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty',

  matrixWrap: 'overflow-x-auto rounded-lg border border-border bg-surface-raised',
  matrixTable: 'w-full min-w-[52rem] border-collapse text-start text-sm',
  matrixHeadCell:
    'border-b border-border px-4 py-3 text-start font-mono text-[0.6875rem] font-medium tracking-[0.1em] text-muted-foreground uppercase',
  matrixPermissionCell: 'border-b border-border px-4 py-4 align-top',
  matrixPermissionLabel: 'font-medium text-foreground',
  matrixPermissionDescription: 'mt-1 text-xs text-muted-foreground',
  matrixGrantCell: 'border-b border-border px-4 py-4 align-top',

  toolbar: 'grid gap-3',
  resultCount: 'text-sm text-muted-foreground',

  pickerWrap: 'overflow-x-auto rounded-lg border border-border bg-surface-raised',
  pickerTable: 'w-full min-w-[48rem] border-collapse text-start text-sm',
  pickerHeadCell:
    'border-b border-border px-4 py-3 text-start font-mono text-[0.6875rem] font-medium tracking-[0.1em] text-muted-foreground uppercase',
  pickerCell: 'border-b border-border px-4 py-4 align-middle text-foreground',
  pickerEditLink:
    'font-medium text-primary-readable underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',

  editorCard: 'grid gap-6 rounded-xl border border-border bg-surface-raised p-6',
  editorHeader: 'grid gap-3',
  editorHeading: 'font-display text-lg font-semibold text-foreground',
  editorHint: 'text-sm text-muted-foreground',
  editorChangeLink:
    'w-fit text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline',
  editorTargetMeta: 'grid gap-1.5 text-sm sm:grid-cols-2',
  editorTargetRow: 'flex flex-wrap items-baseline gap-2',
  editorTargetTerm: 'text-muted-foreground',
  editorTargetValue: 'font-medium text-foreground',

  editorForm: 'grid gap-6',
  checkboxGrid: 'grid gap-4 sm:grid-cols-2',
  checkboxRow: 'grid gap-1.5 rounded-lg border border-border bg-canvas p-4',
  checkboxLabel: 'items-start gap-2.5',
  checkboxDescription: 'pl-6 text-xs leading-relaxed text-muted-foreground text-pretty',
  checkboxLockedHint: 'pl-6 text-xs text-warning',

  editorActions: 'flex flex-wrap items-center gap-3',
  editorConfirmText: 'w-full text-sm text-muted-foreground',
  outcome: 'w-full text-sm',
  outcomeError: 'w-full text-sm text-danger',
} as const;
