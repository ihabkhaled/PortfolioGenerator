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
    'sticky top-0 z-40 border-b border-border bg-canvas/90 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/75 print:hidden',
  headerInner:
    'mx-auto grid min-h-16 max-w-[90rem] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-5 py-2 sm:px-8 lg:grid-cols-[auto_minmax(10rem,0.75fr)_minmax(0,auto)_auto] lg:gap-x-5 lg:px-10',
  brand: 'grid min-w-0 gap-0.5',
  // The brand name doubles as a link back to the platform's own marketing
  // home — distinct from the portfolio's own overview page (`navLinkCurrent`
  // et al.), which is why it carries a different icon (`OverviewIcon` there,
  // `HomeIcon` here) rather than reusing the same one for two different
  // destinations.
  brandLink:
    'group inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border-e border-border pe-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  brandHomeIcon:
    'size-4 shrink-0 text-primary-readable transition-colors group-hover:text-foreground',
  platformName:
    'font-display text-sm font-bold tracking-tight text-foreground group-hover:text-primary-readable',
  identity: 'hidden min-w-0 sm:block',
  headerActions: 'flex min-w-0 items-center justify-end gap-2',
  footerLinks: 'flex flex-wrap items-center gap-3',
  brandName:
    'font-display truncate text-sm font-bold tracking-tight text-foreground sm:text-[0.95rem]',
  brandHeadline:
    'hidden truncate font-mono text-[0.625rem] font-medium uppercase tracking-[0.12em] text-muted-foreground xl:block',
  // The horizontal bar is a `lg:`-and-up affordance now that narrower
  // viewports get their own collapsible menu (`navToggle`/`mobileNav`
  // below) — a scrolling bar and a hamburger both trying to solve the same
  // "too many items" problem at once is worse than either alone.
  // `overflow-x-auto` alone still lets a browser decide it also needs a
  // *vertical* scrollbar on a wide-but-short bar, and Windows renders that
  // as a pair of stepper arrows next to the navigation; pinning the
  // vertical axis keeps the overflow behaviour without the furniture, for
  // the rarer case of a portfolio with enough custom pages to overflow even
  // the desktop width.
  nav: 'scroll-fade-x hidden min-w-0 items-center justify-center gap-0.5 overflow-x-auto overflow-y-hidden [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden',
  navLink:
    'relative inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-2 text-[0.8125rem] font-medium whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring xl:px-3 xl:text-sm',
  navLinkCurrent:
    'bg-muted/70 text-foreground after:absolute after:inset-x-3 after:-bottom-[0.8125rem] after:h-0.5 after:rounded-full after:bg-primary after:content-[""]',
  // The hamburger toggle only exists below `sm` — the same breakpoint where
  // `nav` above disappears — so exactly one of the two navigation
  // affordances is ever on screen at once.
  navToggle:
    'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring lg:hidden',
  // `absolute` against `header`'s own `sticky` positioning (sticky counts as
  // a positioned ancestor) rather than pushing page content down in normal
  // flow — the toggle button and this panel share one client component
  // instance, but live at different depths inside `headerActions`, so
  // anchoring to the header itself is what keeps the panel full-width
  // regardless of the button's own position within that row.
  mobileNav:
    'absolute inset-x-0 top-full z-40 grid gap-1 border-b border-border bg-canvas px-5 py-3 shadow-lg lg:hidden',
  mobileNavLink:
    'relative flex min-h-11 cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  mobileNavLinkCurrent: 'bg-muted text-foreground',
  // The locale switcher (`localizationClasses.controls`) is `fixed` at the
  // viewport bottom, not appended after the document's last element, so on a
  // short page `body`'s own bottom reserve (src/app/styles.css) never comes
  // into play — the page never scrolls far enough for it to matter. This
  // reserve clears the switcher's own height (control padding + the select)
  // plus its bottom inset regardless of page length.
  main: 'mx-auto w-full max-w-6xl px-5 pb-[5.5rem] sm:px-8 lg:px-10',
  footer: 'mt-24 border-t border-border bg-surface/40 print:hidden',
  footerInner:
    'mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5 py-12 sm:px-8 lg:px-10',
  footerNote: 'font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground',
  footerNoteLink:
    'underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:text-foreground focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
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
  // `items-start` overrides grid's default `stretch`: without it every card
  // in a row grows to match its tallest sibling, leaving uneven dead space
  // below a short description next to a long one.
  list: 'grid items-start gap-4 sm:grid-cols-2',
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
  // The regional-indicator flag emoji has no fallback glyph: several Windows
  // builds render the two codepoints as bare capital letters (e.g. `EG`)
  // instead of composing a flag. Wrapping the emoji in a badge means that
  // failure mode still reads as an intentional country-code chip rather than
  // a rendering bug, whichever way the reader's font renders it.
  phoneValue: 'inline-flex flex-wrap items-center gap-1.5',
  phoneFlag:
    'inline-flex min-w-[1.75rem] items-center justify-center rounded-full border border-border bg-surface px-1 py-0.5 font-mono text-[0.6875rem] leading-none text-muted-foreground',
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

export const supplementalClasses = {
  stack: 'grid gap-8',
  section: 'grid gap-3',
  heading: 'font-display text-lg font-semibold tracking-tight text-foreground',
  chips: 'flex flex-wrap gap-2',
  chip: 'rounded-full border border-border bg-surface-raised px-3 py-1 text-sm text-foreground',
  quotes: 'grid gap-4 sm:grid-cols-2',
  quote: 'grid gap-3 rounded-lg border border-border bg-surface-raised p-5',
  quoteText: 'leading-relaxed text-foreground',
  quoteByline: 'text-sm text-muted-foreground',
  gallery: 'grid gap-4 sm:grid-cols-2',
  figure: 'overflow-hidden rounded-lg border border-border bg-surface-raised',
  galleryTrigger:
    'block w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  galleryImage: 'aspect-[4/3] w-full object-cover',
  caption: 'p-3 text-sm text-muted-foreground',
  attachments: 'grid gap-2',
  attachment:
    'inline-flex w-fit items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-primary-readable hover:bg-muted',
  lightboxDialog:
    'm-auto max-h-[90vh] max-w-[90vw] overflow-visible rounded-lg bg-transparent p-0 backdrop:bg-black/80',
  lightboxFrame: 'relative grid max-h-[90vh] max-w-[90vw] gap-2',
  lightboxImage: 'max-h-[80vh] w-auto rounded-lg object-contain',
  lightboxCaption: 'text-center text-sm text-white',
  lightboxClose:
    'absolute -top-4 -right-4 flex size-9 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
} as const;
