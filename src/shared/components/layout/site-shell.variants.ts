import { buttonVariants } from '@/packages/ui-primitives';

/**
 * The platform shell's class bundles. Editorial-technology direction: hairline
 * rules, layered neutral surfaces, one confident accent, generous whitespace.
 * Nothing here uses a raw palette value — only semantic tokens, so the same
 * markup renders correctly in both themes.
 *
 * The header collapses at the `sm:` breakpoint, matching the rest of the
 * platform shell rather than introducing a second breakpoint scheme: the
 * primary nav and actions render inline at `sm:` and up, and fold behind the
 * `NavDisclosure` hamburger below it.
 */
export const siteShellClasses = {
  header:
    'sticky top-0 z-50 border-b border-border bg-canvas/85 backdrop-blur-md supports-[backdrop-filter]:bg-canvas/70',
  headerInner:
    'mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-5 py-2 sm:gap-4 sm:px-8 lg:px-10',

  brandGroup: 'flex min-w-0 shrink-0 items-center gap-0.5 sm:gap-1',
  homeLink:
    'inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  brand: 'group inline-flex min-w-0 shrink-0 items-baseline gap-2.5 text-foreground',
  brandName: 'font-display whitespace-nowrap text-[0.95rem] font-bold tracking-tight',
  brandRole:
    'hidden truncate font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground sm:inline',
  // For real user-supplied data next to the brand mark — a signed-in email,
  // not a marketing tagline. `brandRole`'s uppercase tracked mono treatment is
  // built for a handful of short display words; forcing an email address
  // through it (`USER@EXAMPLE.COM`) fights the one thing a user actually
  // wants here, which is to read it back correctly.
  brandEmail: 'hidden truncate text-[0.8125rem] font-medium text-muted-foreground sm:inline',

  headerActions: 'hidden min-w-0 items-center justify-end gap-2 sm:flex sm:gap-3',
  nav: 'flex items-center gap-1 sm:gap-2',
  navLink:
    'inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-2 text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  // Precomputed rather than called inline from `SiteAuthNav`: that file is a
  // `*.component.tsx`, and a config-object call in a JSX prop belongs in the
  // design system, not in the component that renders it.
  navPrimaryAction: buttonVariants({ variant: 'primary', size: 'sm' }),

  // The hamburger disclosure: hidden once `headerActions` has room to show
  // inline, `relative` so its panel anchors to the toggle rather than the
  // page. `list-none` plus the webkit selector remove the browser's default
  // disclosure triangle — the menu icon is the only affordance needed.
  mobileMenu: 'relative sm:hidden',
  mobileMenuToggle:
    'inline-flex size-11 list-none items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden',
  mobileMenuPanel:
    'absolute end-0 top-[calc(100%+0.5rem)] z-50 grid w-64 gap-3 rounded-lg border border-border bg-surface-raised p-3 shadow-md',
  mobileNav: 'grid gap-1',
  mobileActions: 'flex flex-wrap items-center justify-center gap-2 border-t border-border pt-3',

  main: 'relative min-h-[60dvh]',

  footer: 'mt-24 border-t border-border bg-surface/40',
  footerInner:
    'mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16 lg:px-10',
  footerBrand: 'grid content-start gap-4',
  footerBrandRow: 'flex items-center gap-2',
  footerBrandName: 'font-display text-base font-bold tracking-tight text-foreground',
  footerNote: 'max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty',
  footerColumns: 'grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4',
  footerColumn: 'grid content-start gap-3',
  footerColumnHeading:
    'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground',
  footerColumnList: 'grid gap-2.5',
  footerLink:
    'inline-flex min-h-11 cursor-pointer items-center text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
} as const;
