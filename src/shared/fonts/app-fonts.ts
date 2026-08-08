import { IBM_Plex_Mono, Inter, Noto_Sans_Arabic, Space_Grotesk } from 'next/font/google';

/**
 * Owner of next/font. Every face loads with `display: swap` and an adjusted
 * metric fallback so the swap does not shift layout.
 *
 * The Arabic face is here because portfolio *content* is the tenant's, in the
 * tenant's language — a CV in Arabic must not render in a broken Latin
 * fallback. Selection happens per `[lang]` in src/app/styles.css.
 */

/** Display face: an engineered grotesque, headings only. */
const displayFont = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display-latin',
  display: 'swap',
});

/** Body face: high legibility across Latin, Latin-ext and Cyrillic. */
const bodyFont = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-body-latin',
  display: 'swap',
});

/** Utility face: metadata rows and technical labels, never prose. */
const monoFont = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-latin',
  display: 'swap',
});

const arabicFont = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  display: 'swap',
});

export const appFontClassName = [
  displayFont.variable,
  bodyFont.variable,
  monoFont.variable,
  arabicFont.variable,
].join(' ');
