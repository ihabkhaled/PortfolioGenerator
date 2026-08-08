export const importClasses = {
  page: 'mx-auto grid w-full max-w-3xl gap-8 px-5 py-12 sm:px-8 sm:py-16',
  header: 'grid gap-3 border-b border-border pb-8',
  title: 'font-display text-3xl font-bold tracking-[-0.025em] text-foreground',
  lead: 'max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty',

  panel: 'grid gap-5 rounded-lg border border-border bg-surface-raised px-6 py-6',
  dropzone:
    'grid justify-items-center gap-3 rounded-lg border border-dashed border-border-strong bg-surface/40 px-6 py-12 text-center',
  dropzoneTitle: 'font-display text-base font-semibold tracking-tight text-foreground',
  dropzoneHint: 'max-w-md text-sm leading-relaxed text-muted-foreground text-pretty',
  fileInput:
    'block w-full text-sm text-muted-foreground file:me-4 file:cursor-pointer file:rounded-md file:border file:border-border file:bg-surface-raised file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:border-border-strong',
  fieldLabel: 'sr-only',
  fileName: 'truncate font-mono text-[0.6875rem] text-muted-foreground',
  actions: 'flex flex-wrap items-center gap-3',

  error: 'flex items-start gap-2 rounded-md border border-danger/40 bg-danger/8 px-3 py-2.5',
  errorText: 'text-sm text-danger',

  facts: 'divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface-raised',
  fact: 'grid gap-1 px-5 py-4',
  factLabel:
    'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground',
  factValue: 'text-sm leading-relaxed text-foreground text-pretty',
} as const;
