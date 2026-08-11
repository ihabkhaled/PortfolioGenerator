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
  // `leading-tight` (not `leading-none`) is deliberate: this headline
  // regularly wraps to two lines at the widths it actually renders at, and a
  // line-height at or near 1 packs the second line close enough to the first
  // that ascenders and descenders collide — reading as clipped text rather
  // than as a tight display headline.
  title: 'font-display text-[clamp(2.5rem,6vw,4rem)] font-bold leading-tight tracking-[-0.035em]',
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

export const topicClasses = {
  // `surface-grid`'s `mask-image` fades whatever it is applied to, not just
  // its own background pattern — putting it on the same element as the
  // heading faded the heading with it. `wrapper`/`grid`/`inner` mirrors
  // `heroClasses` above: the mask lives on an isolated, absolutely-positioned
  // decorative layer, and the actual content is a normal, fully opaque
  // sibling stacked above it.
  wrapper: 'relative overflow-hidden border-b border-border',
  grid: 'surface-grid pointer-events-none absolute inset-0',
  hero: 'relative grid gap-6 px-5 py-20 sm:px-8 lg:px-10 lg:py-28',
  eyebrow:
    'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-primary-readable',
  // Same fix as `heroClasses.title`: these topic-page headlines are long
  // enough to wrap, and `leading-none` made the wrapped second line collide
  // with the first instead of reading as a second, legible line.
  title:
    'max-w-4xl font-display text-[clamp(2.5rem,7vw,4.5rem)] font-bold leading-tight tracking-tight',
  lead: 'max-w-2xl text-lg leading-relaxed text-muted-foreground',
  related: 'flex flex-wrap gap-3',
  relatedLink:
    'rounded-md border border-border px-4 py-3 text-sm text-primary-readable hover:bg-muted',
  sectionBody: 'max-w-2xl leading-relaxed text-muted-foreground',
} as const;

export const directoryClasses = {
  grid: 'grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4',
  item: 'grid min-h-56 content-start gap-3 bg-surface-raised p-5',
  title: 'font-display text-lg font-semibold tracking-tight text-foreground',
  description: 'text-sm leading-relaxed text-muted-foreground text-pretty',
  link: 'mt-auto inline-flex min-h-11 w-fit cursor-pointer items-center font-mono text-xs font-medium uppercase tracking-[0.12em] text-primary-readable underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
} as const;

export const faqClasses = {
  list: 'divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface-raised',
  item: 'px-5 py-1 sm:px-7',
  question:
    'flex min-h-14 cursor-pointer items-center font-display font-semibold text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  answer: 'max-w-3xl pb-5 text-sm leading-relaxed text-muted-foreground text-pretty',
} as const;

export const ctaClasses = {
  panel:
    'grid gap-6 rounded-lg border border-border bg-surface-raised p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center',
  copy: 'grid gap-2',
  title: 'font-display text-2xl font-bold tracking-tight text-foreground',
  description: 'max-w-2xl leading-relaxed text-muted-foreground',
  actions: 'flex flex-wrap gap-3',
} as const;
