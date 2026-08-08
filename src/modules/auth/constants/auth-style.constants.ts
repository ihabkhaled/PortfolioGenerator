export const authClasses = {
  page: 'mx-auto grid w-full max-w-md gap-8 px-5 py-16 sm:py-24',
  header: 'grid gap-2',
  title: 'font-display text-3xl font-bold tracking-[-0.02em] text-foreground',
  lead: 'text-sm leading-relaxed text-muted-foreground text-pretty',
  form: 'grid gap-5',
  field: 'grid gap-1.5',
  hint: 'text-xs text-muted-foreground',
  error: 'flex items-start gap-2 rounded-md border border-danger/40 bg-danger/8 px-3 py-2.5',
  errorText: 'text-sm text-danger',
  submit: 'w-full',
  switchLink:
    'text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground',
} as const;
