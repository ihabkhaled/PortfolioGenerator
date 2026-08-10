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
  link: 'text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline print:hidden',
} as const;
