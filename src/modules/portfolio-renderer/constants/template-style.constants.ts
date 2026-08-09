/**
 * `reference-classic-v1` — the published portfolio's visual system.
 *
 * Adapted from the reference portfolio's editorial-technology direction:
 * layered neutral surfaces, hairline borders, one confident accent used
 * sparingly, a monospace eyebrow rail that doubles as a table of contents, and
 * a bordered label/value "manifest" panel reused everywhere metadata appears.
 *
 * Every value is a semantic token. A tenant picks a named accent, never a
 * colour, so contrast ratios stay the ones the accessibility suite asserts.
 */

export const portfolioShellClasses = {
  root: 'min-h-dvh bg-canvas text-foreground',
  header:
    'sticky top-0 z-40 border-b border-border bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70',
  headerInner:
    'mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8 lg:px-10',
  brand: 'grid min-w-0',
  headerActions: 'flex min-w-0 items-center gap-2 sm:gap-3',
  footerLinks: 'flex flex-wrap items-center gap-3',
  brandName: 'font-display truncate text-[0.95rem] font-bold tracking-tight text-foreground',
  brandHeadline:
    'truncate font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground',
  // `overflow-x-auto` alone lets a browser decide it also needs a *vertical*
  // scrollbar, and Windows renders that as a pair of stepper arrows next to the
  // navigation. Pinning the vertical axis and hiding the horizontal bar keeps
  // the overflow behaviour without the furniture.
  nav: 'flex items-center gap-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  navLink:
    'relative inline-flex items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  navLinkCurrent:
    'text-foreground after:absolute after:inset-x-3 after:-bottom-px after:h-px after:bg-primary after:content-[""]',
  main: 'mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-10',
  footer: 'mt-24 border-t border-border bg-surface/40',
  footerInner:
    'mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-12 sm:px-8 lg:px-10',
  footerNote: 'font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground',
  footerLink:
    'text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline',
} as const;

export const navActionClasses = {
  row: 'flex items-center gap-2',
} as const;

export const heroClasses = {
  wrapper: 'relative -mx-5 overflow-hidden border-b border-border sm:-mx-8 lg:-mx-10',
  grid: 'surface-grid pointer-events-none absolute inset-0',
  inner:
    'relative mx-auto grid max-w-5xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:px-10 lg:py-24',
  content: 'grid gap-5',
  portraitFrame:
    'size-24 overflow-hidden rounded-full border border-border bg-surface-raised sm:size-28',
  portrait: 'size-full object-cover',
  availability:
    'inline-flex w-fit items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-success-readable',
  availabilityDot: 'size-1.5 rounded-full bg-success',
  name: 'font-display text-[clamp(2.25rem,6vw,3.75rem)] font-bold leading-[1.0] tracking-[-0.035em] text-balance',
  headline: 'font-display text-lg font-medium tracking-tight text-muted-foreground sm:text-xl',
  summary: 'max-w-xl leading-relaxed text-foreground text-pretty',
  actions: 'flex flex-wrap items-center gap-3 pt-1',
  socialRow: 'flex flex-wrap items-center gap-x-5 gap-y-2 pt-1',
  socialLink:
    'inline-flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline',
  aside: 'grid gap-4',
} as const;

export const timelineClasses = {
  list: 'divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface-raised',
  item: 'grid gap-4 px-5 py-7 sm:px-7',
  head: 'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1',
  organization: 'font-display text-xl font-semibold tracking-tight text-foreground',
  role: 'text-sm font-medium text-muted-foreground',
  dateRange: 'shrink-0 font-mono text-[0.6875rem] text-muted-foreground',
  summary: 'max-w-2xl leading-relaxed text-muted-foreground text-pretty',
  highlights: 'grid gap-2',
  highlight: 'flex gap-3 text-sm leading-relaxed text-foreground',
  highlightMarker: 'mt-2 size-1 shrink-0 rounded-full bg-primary',
  tags: 'flex flex-wrap gap-1.5 pt-1',
} as const;

export const projectClasses = {
  list: 'grid gap-4 sm:grid-cols-2',
  item: 'grid content-start gap-3 rounded-lg border border-border bg-surface-raised p-5',
  name: 'font-display text-lg font-semibold tracking-tight text-foreground',
  summary: 'leading-relaxed text-sm text-muted-foreground text-pretty',
  highlights: 'grid gap-2',
  highlight: 'flex gap-3 text-sm leading-relaxed text-foreground',
  highlightMarker: 'mt-2 size-1 shrink-0 rounded-full bg-primary',
  tags: 'flex flex-wrap gap-1.5',
  links: 'flex flex-wrap gap-x-4 gap-y-1 pt-1',
  link: 'inline-flex items-center gap-1.5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-primary-readable underline-offset-4 hover:underline',
} as const;

export const skillsClasses = {
  list: 'grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2',
  group: 'grid content-start gap-3 bg-surface-raised px-5 py-5',
  label: 'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground',
  items: 'flex flex-wrap gap-1.5',
} as const;

export const factListClasses = {
  list: 'divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface-raised',
  item: 'grid gap-1 px-5 py-5 sm:px-7',
  head: 'flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1',
  title: 'font-display text-base font-semibold tracking-tight text-foreground',
  subtitle: 'text-sm text-muted-foreground',
  meta: 'shrink-0 font-mono text-[0.6875rem] text-muted-foreground',
  detail: 'max-w-2xl text-sm leading-relaxed text-muted-foreground text-pretty',
  link: 'w-fit font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-primary-readable underline-offset-4 hover:underline',
} as const;

export const aboutClasses = {
  prose: 'grid max-w-2xl gap-4 leading-relaxed text-foreground',
  paragraph: 'text-pretty',
} as const;

export const contactClasses = {
  panel: 'grid gap-6 rounded-lg border border-border bg-surface-raised px-6 py-8 sm:px-8',
  rows: 'grid gap-3',
  row: 'flex flex-wrap items-baseline gap-x-3 gap-y-1',
  label: 'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground',
  value: 'text-sm text-foreground',
  link: 'text-sm text-primary-readable underline-offset-4 hover:underline',
  links: 'flex flex-wrap gap-x-5 gap-y-2',
} as const;

export const customBlockClasses = {
  wrapper: 'grid gap-5',
  paragraph: 'max-w-2xl leading-relaxed text-foreground text-pretty',
  bulletList: 'grid max-w-2xl gap-2',
  bulletItem: 'flex gap-3 text-sm leading-relaxed text-foreground',
  bulletMarker: 'mt-2 size-1 shrink-0 rounded-full bg-primary',
  statList: 'grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3',
  statItem: 'grid gap-1 bg-surface-raised px-5 py-4',
  statLabel:
    'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground',
  statValue: 'font-display text-lg font-semibold tracking-tight text-foreground',
  links: 'flex flex-wrap gap-x-5 gap-y-2',
  link: 'inline-flex items-center gap-1.5 text-sm text-primary-readable underline-offset-4 hover:underline',
} as const;
