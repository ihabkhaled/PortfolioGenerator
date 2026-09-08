import {
  SAFE_URL_PROTOCOLS,
  URL_LEADING_PUNCTUATION_PATTERN,
  URL_MAX_LENGTH,
  URL_SCHEME_PATTERN,
} from '@/shared/constants/security.constants';
import { CONTROL_CHARACTER_PATTERN } from '@/shared/constants/text.constants';

/**
 * URL safety policy.
 *
 * Every URL in a published portfolio arrived from somewhere untrusted: text a
 * model extracted from a CV, or a field a user typed. Two separate risks follow
 * from that, and this file is where both are closed:
 *
 *   1. `javascript:` / `data:` / `vbscript:` URLs in an anchor are stored XSS.
 *      Only `https:` and `mailto:` are ever rendered as links.
 *   2. A URL the *server* fetches is an SSRF primitive. We never fetch a
 *      user-supplied URL — `isSafeExternalUrl` gates rendering, not fetching,
 *      and no code path in this product turns a portfolio URL into a request.
 *
 * `http:` is excluded deliberately: a portfolio is a public professional
 * artifact, and a mixed-content link is both a downgrade and a bad look.
 */

export function isSafeExternalUrl(candidate: string): boolean {
  return normalizeSafeUrl(candidate) !== null;
}

/**
 * Return a canonical, safe form of the URL, or null when it must not be
 * rendered as a link. Canonicalizing here (rather than at each call site) is
 * what lets publish-time validation and render-time checks agree.
 */
export function normalizeSafeUrl(candidate: string): string | null {
  const trimmed = candidate.trim();

  if (trimmed.length === 0 || trimmed.length > URL_MAX_LENGTH) {
    return null;
  }

  // A control character inside a URL is only ever an attempt to smuggle a
  // scheme past a naive prefix check ("java\nscript:").
  if (CONTROL_CHARACTER_PATTERN.test(trimmed)) {
    return null;
  }

  let parsed: URL;

  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (!SAFE_URL_PROTOCOLS.includes(parsed.protocol)) {
    return null;
  }

  return parsed.href;
}

/**
 * A forgiving reading of a URL that came out of a CV, reduced to the same
 * safety policy as everything else.
 *
 * CVs are written for humans: addresses are typed bare ("github.com/name"),
 * pasted with the label's punctuation still attached
 * ("LinkedIn:.linkedin.com/in/name"), or given as http. All three are the
 * author's real link, and dropping them loses information the document plainly
 * contained — so the shape is repaired and the result is then held to
 * `normalizeSafeUrl` unchanged.
 *
 * What is *not* repaired is a scheme the author actually wrote: anything
 * already carrying one is passed through as-is, so `javascript:` and `data:`
 * are still rejected rather than rewritten into something safe-looking. The
 * scheme test excludes dots for that reason — it must not mistake a bare
 * "example.com:8080/path" for a scheme and refuse to prefix it.
 */
export function coerceExtractedUrl(candidate: string): string | null {
  const trimmed = candidate.trim().replace(URL_LEADING_PUNCTUATION_PATTERN, '');

  if (trimmed.length === 0) {
    return null;
  }

  if (URL_SCHEME_PATTERN.test(trimmed)) {
    // http is the one scheme worth rewriting: the same address, and this
    // policy excludes plain http only over transport, not destination.
    return normalizeSafeUrl(trimmed.replace(/^http:\/\//iu, 'https://'));
  }

  return normalizeSafeUrl(`https://${trimmed}`);
}

/**
 * Display form for a link whose full URL is noise: `https://github.com/x/y`
 * becomes `github.com/x/y`. Falls back to the input when it is not parseable,
 * because this is presentation only and never a safety decision.
 */
export function toDisplayUrl(candidate: string): string {
  const normalized = normalizeSafeUrl(candidate);

  if (normalized === null) {
    return candidate;
  }

  const parsed = new URL(normalized);

  if (parsed.protocol === 'mailto:') {
    return parsed.pathname;
  }

  const path = parsed.pathname === '/' ? '' : parsed.pathname;

  return `${parsed.host}${path}`.replace(/\/$/u, '');
}
