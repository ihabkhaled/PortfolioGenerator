/**
 * Section rhythm for the editorial layout — the visual language this product
 * borrows from the reference portfolio.
 *
 * A page is a stack of sections. Each opens with a monospace eyebrow, a
 * display-face title, and a hairline that spans the measure. The eyebrow is
 * metadata, which is why it is the only monospace text on the page: when
 * everything is emphasised, nothing is.
 */
export const sectionClasses = {
  page: 'mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10',

  /**
   * A left rail of small monospace labels runs down the page; titles and
   * content share the second column so headings always align with what they
   * introduce.
   */
  section:
    'grid gap-4 border-t border-border py-16 first:border-t-0 sm:py-20 lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] lg:gap-10',
  eyebrow:
    'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-muted-foreground lg:pt-2',
  column: 'min-w-0',
  title:
    'font-display text-3xl font-bold leading-[1.1] tracking-[-0.02em] text-balance sm:text-4xl',
  lead: 'mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty',
  body: 'pt-10',
  moreLink:
    'mt-6 inline-flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-primary-readable underline-offset-4 hover:underline',

  /** Page-level heading used once per route, above the first section. */
  pageHeader: 'border-b border-border py-14 sm:py-20',
  pageTitle:
    'font-display text-4xl font-bold leading-[1.05] tracking-[-0.03em] text-balance sm:text-5xl',
  pageLead: 'mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty',
  pageActions: 'mt-8 flex flex-wrap items-center gap-3',
} as const;

/**
 * The signature motif: a bordered panel of label/value rows that reads like a
 * service manifest. Reused by the hero, project rows and experience entries so
 * metadata always looks the same wherever it appears.
 */
export const manifestClasses = {
  panel: 'divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface-raised',
  row: 'grid grid-cols-[minmax(5.5rem,auto)_minmax(0,1fr)] gap-4 px-4 py-3 sm:px-5',
  label: 'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground',
  value: 'min-w-0 text-sm text-foreground',
  valueMono: 'min-w-0 font-mono text-sm text-foreground',
} as const;
