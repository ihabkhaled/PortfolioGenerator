export const feedbackClasses = {
  panel: 'grid gap-2 rounded-lg border border-dashed border-border bg-surface/50 px-6 py-10',
  errorPanel: 'relative grid gap-2 rounded-lg border border-danger/40 bg-danger/8 px-6 py-8',
  title: 'font-display text-base font-semibold tracking-tight text-foreground pr-6',
  description: 'max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty',
  actions: 'flex flex-wrap items-center gap-3 pt-3',
  dismiss:
    'absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  // A floating, dismissible notice — install prompts, update offers — is
  // information, not a fault, and it sits on top of arbitrary page content
  // rather than inline in the document flow. `bg-surface-raised/95` plus a
  // shadow keeps it legible over anything scrolled underneath, matching the
  // language switcher's own floating card (`localization-style.constants`)
  // rather than borrowing the danger-tinted `errorPanel`. Kept deliberately
  // compact — a short auth page has little vertical room to spare before a
  // fixed-position card starts covering its own controls.
  noticePanel:
    'relative grid gap-1.5 rounded-lg border border-border bg-surface-raised/95 px-4 py-3 shadow-lg backdrop-blur',
  noticeBody: 'flex flex-wrap items-center gap-x-4 gap-y-2 pr-6',
  noticeText: 'grid min-w-0 flex-1 gap-0.5',
  noticeTitle: 'font-display text-sm font-semibold tracking-tight text-foreground',
  noticeDescription: 'text-xs leading-snug text-muted-foreground text-pretty',
} as const;
