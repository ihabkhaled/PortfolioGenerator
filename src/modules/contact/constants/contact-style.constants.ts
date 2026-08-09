export const contactFormClasses = {
  section: 'mx-auto grid max-w-3xl gap-6 px-5 py-16 sm:px-8 lg:px-10',
  heading: 'font-display text-2xl font-semibold tracking-tight',
  lead: 'max-w-2xl leading-relaxed text-muted-foreground',
  form: 'grid gap-5 rounded-lg border border-border bg-surface-raised p-5 sm:p-7',
  field: 'grid gap-2',
  hidden: 'sr-only',
  actions: 'flex flex-wrap items-center gap-3',
  success: 'text-sm text-success',
  error: 'text-sm text-destructive',
} as const;
