import {
  COLOR_SCHEME_QUERY,
  SAVED_THEME_COOKIE,
  THEME_ACCOUNT_SYNC_COOKIE,
  THEME_ATTRIBUTE,
  THEME_STORAGE_KEY,
  THEME_SYSTEM_OVERRIDE_KEY,
} from './theme.constants';

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
    `var o=localStorage.getItem('${THEME_SYSTEM_OVERRIDE_KEY}')==='1';`,
    `var c=document.cookie.split('; ').find(function(v){return v.indexOf('${SAVED_THEME_COOKIE}=')===0;});`,
    "var s=c?decodeURIComponent(c.slice(c.indexOf('=')+1)):'system';",
    `var a=document.cookie.split('; ').some(function(v){return v.indexOf('${THEME_ACCOUNT_SYNC_COOKIE}=')===0;});`,
    `if(a){if(s==='light'||s==='dark'){localStorage.setItem('${THEME_STORAGE_KEY}',s);localStorage.removeItem('${THEME_SYSTEM_OVERRIDE_KEY}');p=s;o=false;}else{localStorage.removeItem('${THEME_STORAGE_KEY}');localStorage.setItem('${THEME_SYSTEM_OVERRIDE_KEY}','1');p=null;o=true;}document.cookie='${THEME_ACCOUNT_SYNC_COOKIE}=; path=/; max-age=0; SameSite=Lax';}`,
    `var d=window.matchMedia('${COLOR_SCHEME_QUERY}').matches;`,
    "var q=p==='light'||p==='dark'?p:(o?'system':(s==='light'||s==='dark'?s:'system'));",
    "var t=q==='system'?(d?'dark':'light'):q;",
    `document.documentElement.setAttribute('${THEME_ATTRIBUTE}',t);`,
    'document.documentElement.style.colorScheme=t;',
    '}catch(e){}})();',
  ].join('');
}
