export const adminShellClasses = {
  root: 'grid min-h-dvh grid-cols-[240px_1fr] bg-canvas text-foreground',
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
} as const;
