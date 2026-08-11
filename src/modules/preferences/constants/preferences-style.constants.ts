export const preferencesClasses = {
  // `print:hidden`: a printed page — including every page the portfolio PDF
  // renderer captures (`page.pdf()` uses print media by default) — has no use
  // for a control that switches which theme is currently on screen.
  group:
    'inline-flex items-center gap-0.5 rounded-full border border-border bg-surface-raised p-0.5 print:hidden',
  option:
    'inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
  optionActive: 'bg-muted text-foreground',
} as const;
