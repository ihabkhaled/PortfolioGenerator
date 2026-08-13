export const adminAuthClasses = {
  page: 'mx-auto grid min-h-dvh max-w-sm content-center gap-8 px-5 py-16',
  header: 'grid gap-2 text-center',
  title: 'font-display text-2xl font-bold tracking-tight text-foreground',
  lead: 'text-sm text-muted-foreground',
  form: 'grid gap-4 rounded-lg border border-border bg-surface-raised p-6',
  field: 'grid gap-2',
  error: 'rounded-md border border-danger/40 bg-danger/8 px-4 py-3 text-sm text-danger',
  qrFrame: 'grid justify-items-center gap-4 rounded-lg border border-border bg-surface-raised p-6',
  qrImage: 'size-48 rounded-md bg-white p-3',
  secret: 'break-all rounded-md bg-surface-sunken px-3 py-2 font-mono text-xs text-foreground',
  backupCodes:
    'grid grid-cols-2 gap-2 rounded-md bg-surface-sunken p-4 font-mono text-sm text-foreground',
} as const;
