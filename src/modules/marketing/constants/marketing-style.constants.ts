/**
 * Landing-page class bundles.
 *
 * The hero pairs a large display headline with a bordered "manifest" panel, so
 * the first thing a visitor sees is a claim and the evidence for it side by
 * side — the same motif the published portfolio template uses, which is the
 * point: the marketing page and the product should not look like two products.
 */
export const heroClasses = {
  wrapper: 'relative overflow-hidden border-b border-border',
  grid: 'surface-grid pointer-events-none absolute inset-0',
  inner:
    'relative mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:px-10 lg:py-28',
  content: 'grid gap-6',
  eyebrow:
    'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-primary-readable',
  title: 'font-display text-[clamp(2.5rem,6vw,4rem)] font-bold leading-[1.02] tracking-[-0.035em]',
  lead: 'max-w-xl text-lg leading-relaxed text-foreground text-pretty',
  supporting: 'max-w-xl leading-relaxed text-muted-foreground text-pretty',
  actions: 'flex flex-wrap items-center gap-3 pt-2',
  aside: 'grid gap-4',
} as const;

export const stepListClasses = {
  list: 'divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface-raised',
  item: 'grid gap-x-5 gap-y-1 px-5 py-5 sm:grid-cols-[3rem_minmax(0,14rem)_minmax(0,1fr)] sm:items-baseline sm:px-7',
  step: 'font-mono text-[0.6875rem] font-medium tracking-[0.12em] text-muted-foreground',
  title: 'font-display text-base font-semibold tracking-tight text-foreground',
  description: 'text-sm leading-relaxed text-muted-foreground text-pretty',
} as const;

export const principleListClasses = {
  list: 'grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2',
  item: 'grid gap-2 bg-surface-raised px-5 py-6',
  title: 'font-display text-base font-semibold tracking-tight text-foreground',
  description: 'text-sm leading-relaxed text-muted-foreground text-pretty',
} as const;
