/**
 * The platform shell's class bundles. Editorial-technology direction: hairline
 * rules, layered neutral surfaces, one confident accent, generous whitespace.
 * Nothing here uses a raw palette value — only semantic tokens, so the same
 * markup renders correctly in both themes.
 */
export const siteShellClasses = {
  header:
    'sticky top-0 z-50 border-b border-border bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70',
  headerInner:
    'mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-5 sm:gap-4 sm:px-8 lg:px-10',

  brand: 'group inline-flex shrink-0 items-baseline gap-2.5 text-foreground',
  brandName: 'font-display whitespace-nowrap text-[0.95rem] font-bold tracking-tight',
  brandRole:
    'hidden truncate font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:inline',

  nav: 'flex items-center gap-1 sm:gap-2',
  navLink:
    'rounded-md px-2.5 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground',

  main: 'relative min-h-[60dvh]',

  footer: 'mt-24 border-t border-border bg-surface/40',
  footerInner:
    'mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_auto] lg:gap-16 lg:px-10',
  footerNote: 'max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty',
  footerLinks: 'grid content-start gap-2.5',
  footerLink: 'text-sm text-muted-foreground transition-colors hover:text-foreground',
} as const;
