export const adminShellClasses = {
  root: 'grid min-h-dvh grid-rows-[auto_1fr] bg-canvas text-foreground',
  body: 'grid grid-cols-[240px_1fr]',
  nav: 'grid content-start gap-1 border-r border-border bg-surface-raised p-4',
  navBrand: 'mb-4 font-display text-lg font-bold tracking-tight text-foreground',
  navLink:
    'rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
  navLinkCurrent: 'bg-muted text-foreground',
  navLinkDisabled:
    'cursor-not-allowed rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/50',
  main: 'grid content-start gap-8 p-8',
  statsGrid: 'grid grid-cols-2 gap-4 sm:grid-cols-3',
  statTile: 'grid gap-1 rounded-lg border border-border bg-surface-raised p-5',
  statLabel:
    'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-muted-foreground',
  statValue: 'font-display text-2xl font-semibold tracking-tight text-foreground',

  topBar:
    'flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-raised px-6 py-3',
  topBarBrandGroup: 'flex items-center gap-3',
  topBarHomeLink:
    'inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  topBarBrand: 'font-display text-sm font-bold tracking-tight text-foreground',
  topBarActions: 'flex flex-wrap items-center justify-end gap-2',

  accountMenu: 'group relative shrink-0',
  accountMenuToggle:
    'inline-flex min-h-11 list-none cursor-pointer items-center gap-2 rounded-full border border-border bg-canvas py-1 pe-3 ps-1 text-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden',
  accountAvatar:
    'inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-raised font-display text-sm font-bold text-foreground',
  accountMenuName: 'text-sm font-medium whitespace-nowrap text-foreground',
  accountMenuIndicator:
    'shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180',
  accountMenuPanel:
    'absolute end-0 top-[calc(100%+0.5rem)] z-50 grid min-w-56 gap-1 rounded-lg border border-border bg-surface-raised p-3 shadow-lg',
  accountMenuIdentity: 'mb-1 grid gap-0.5 border-b border-border pb-2',
  accountMenuEmail: 'truncate text-xs text-muted-foreground',
  accountMenuRole:
    'font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-muted-foreground',
  accountMenuLink:
    'inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  accountMenuLogout: 'border-t border-border pt-1 [&_button]:w-full [&_button]:justify-start',
} as const;
