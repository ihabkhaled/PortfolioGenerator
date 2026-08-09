import { COLOR_SCHEME_QUERY, THEME_ATTRIBUTE, THEME_STORAGE_KEY } from './theme.constants';

/**
 * The anti-flash script.
 *
 * Runs before first paint, reads the stored preference, and stamps the
 * attribute. Without it a reader who chose dark gets a white flash on every
 * navigation that reaches the server — which is the one thing a theme toggle
 * exists to prevent.
 *
 * Built as a string rather than imported as a module because it must execute
 * synchronously in `<head>`, before React has loaded anything. It is inlined
 * under the CSP nonce, so it is not an inline-script hole.
 */
export function buildThemeScript(): string {
  return [
    '(function(){try{',
    `var p=localStorage.getItem('${THEME_STORAGE_KEY}');`,
    `var d=window.matchMedia('${COLOR_SCHEME_QUERY}').matches;`,
    "var t=p==='light'||p==='dark'?p:(d?'dark':'light');",
    `document.documentElement.setAttribute('${THEME_ATTRIBUTE}',t);`,
    'document.documentElement.style.colorScheme=t;',
    '}catch(e){}})();',
  ].join('');
}
