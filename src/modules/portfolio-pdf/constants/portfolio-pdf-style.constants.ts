/**
 * Visually matches the public portfolio footer's existing link style
 * (`portfolioShellClasses.footerLink` in `portfolio-renderer`) without
 * reaching into that module's internals for one class string. `print:hidden`
 * is the addition: this link is captured on every page the PDF renderer
 * prints (it lives in the footer, which every page shares), and a "Download
 * PDF" link inside the PDF itself would point at nothing once the file is
 * already saved.
 */
export const portfolioPdfDownloadLinkClasses = {
  link: 'inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-foreground underline-offset-4 transition-colors hover:bg-surface-raised focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring print:hidden',
} as const;
