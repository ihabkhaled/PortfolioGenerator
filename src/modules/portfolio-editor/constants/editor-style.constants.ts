/**
 * Editor layout.
 *
 * Two panes on desktop — forms left, live preview right — and tabs on mobile,
 * because the whole task is "does this read right", and an edit you cannot see
 * the result of is an edit you make twice.
 */
export const editorClasses = {
  // The number is the fact a reader copies; the country is context for reading
  // it. Narrow enough that the flag and dial code stay visible with the
  // country name clipped, wide enough not to clip the flag+dial pair itself.
  phoneRow: 'grid gap-2 sm:grid-cols-[minmax(0,7rem)_minmax(0,1fr)]',
  phoneCountrySelect: 'truncate',
  shell: 'mx-auto grid w-full max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:px-10',
  header: 'flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6',
  headerMain: 'grid gap-2',
  title: 'font-display text-2xl font-bold tracking-[-0.02em] text-foreground sm:text-3xl',
  subtitle: 'font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground',
  headerActions: 'flex flex-wrap items-center gap-2',

  // Below `lg` there is no room for both panes, so a segmented control swaps
  // which one is visible; at `lg` and up the control disappears and both
  // panes show, unconditionally, side by side. Each pane below has a
  // complete, self-contained class string per visibility state rather than a
  // shared base plus a toggled `hidden` — the crop dialog bug this module
  // used to ship (see `cropDialog`) is exactly what happens when a `display`
  // utility is layered onto another unscoped `display` utility and the
  // result depends on generation order instead of the state you meant to
  // express.
  mobileTabs: 'grid grid-cols-2 gap-2 lg:hidden',
  panes: 'grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start',
  formPane: 'grid gap-6',
  formPaneMobileHidden: 'hidden gap-6 lg:grid',
  previewPane:
    'sticky top-24 hidden max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-lg border border-border bg-canvas lg:block',
  previewPaneMobileVisible:
    'sticky top-24 block max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-lg border border-border bg-canvas lg:block',
  previewFrame: 'w-full',

  section: 'grid gap-4 rounded-lg border border-border bg-surface-raised px-5 py-5',
  sectionHead: 'flex flex-wrap items-baseline justify-between gap-3',
  sectionTitle: 'font-display text-base font-semibold tracking-tight text-foreground',
  sectionHint: 'text-sm leading-relaxed text-muted-foreground text-pretty',
  fieldGrid: 'grid gap-4 sm:grid-cols-2',
  field: 'grid gap-1.5',
  fieldWide: 'grid gap-1.5 sm:col-span-2',
  fieldHint: 'text-xs text-muted-foreground',
  requiredText: 'sr-only',
  disclosure: 'group rounded-lg border border-border bg-surface-raised',
  disclosureSummary:
    'flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
  disclosureTitle: 'font-display text-base font-semibold tracking-tight text-foreground',
  disclosureMeta: 'font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground',
  disclosureBody: 'grid gap-4 border-t border-border px-5 py-5',

  collection: 'grid gap-3',
  entry: 'grid gap-3 rounded-md border border-border bg-surface/50 px-4 py-4',
  entryHead: 'flex flex-wrap items-center justify-between gap-2',
  entryTitle: 'truncate text-sm font-medium text-foreground',
  entryActions: 'flex shrink-0 items-center gap-1',
  assetEntry:
    'grid gap-3 rounded-md border border-border bg-surface/40 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center',
  assetEntryControls: 'flex flex-wrap items-center gap-2 sm:justify-end',
  assetPlacement: 'flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-medium',

  warning: 'flex items-start gap-2 rounded-md border border-warning/40 bg-warning/8 px-3 py-2',
  warningText: 'text-sm text-warning-readable',
  warningList: 'grid gap-2',

  error: 'flex items-start gap-2 rounded-md border border-danger/40 bg-danger/8 px-3 py-2.5',
  errorText: 'text-sm text-danger',
  status: 'font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground',
  statusSaved: 'font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-success-readable',
  issueNavigator: 'flex flex-wrap items-center gap-2',
  issueMessage: 'basis-full text-xs text-danger',
  issueGeneral: 'basis-full border-t border-border pt-2',
  actionDock:
    'fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+var(--pwa-fixed-surface-reserve)+1rem)] z-40 mx-auto flex max-w-xl flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-raised/95 p-3 shadow-xl backdrop-blur',
  shellWithDock: 'mx-auto grid w-full max-w-7xl gap-6 px-5 pt-8 pb-36 sm:px-8 lg:px-10',

  slugRow: 'grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end',
  slugPreview:
    'flex min-w-0 flex-wrap items-center gap-2 font-mono text-[0.6875rem] text-muted-foreground sm:col-span-2',
  blockerList: 'grid gap-2',
  blocker: 'flex items-start gap-2 text-sm text-warning-readable',

  // No `display` utility here — same reason the mobile panes above never mix
  // a bare `hidden` with a bare `grid`. `<dialog>`'s own UA stylesheet already
  // switches between `display: none` and `display: block` on the `open`
  // attribute; author-origin CSS beats the UA stylesheet regardless of
  // specificity, so a "display: grid" utility applied straight to the dialog
  // — as this one used to carry — stays visible even while closed and
  // intercepts pointer events over whatever sits behind it. The grid layout
  // lives on `cropDialogFrame`, an inner wrapper, instead; the dialog element
  // only ever carries non-display box styling, matching the lightbox dialog
  // in the renderer module (`template-style.constants.ts`'s `lightboxDialog`).
  cropDialog:
    'm-auto max-w-[min(28rem,90vw)] rounded-lg border border-border p-5 backdrop:bg-black/80',
  cropDialogFrame: 'grid gap-4',
  cropTitle: 'font-display text-base font-semibold tracking-tight text-foreground',
  cropViewport:
    'relative mx-auto touch-none overflow-hidden bg-surface-raised outline outline-1 -outline-offset-1 outline-border',
  cropViewportRect: 'aspect-[4/3] w-full rounded-lg',
  cropViewportCircle: 'size-64 max-w-full rounded-full',
  cropSurface:
    'absolute top-0 left-0 origin-top-left cursor-grab select-none active:cursor-grabbing',
  cropZoomRow: 'grid gap-1.5',
  cropActions: 'flex justify-end gap-2',
} as const;
