/**
 * The AdSense publisher id.
 *
 * Public by definition — it appears in `ads.txt`, in the loader URL and in a
 * meta tag — so it is a constant rather than an environment secret. Keeping it
 * in one place means the three places it has to agree cannot drift.
 */
export const ADSENSE_CLIENT_ID = 'ca-pub-2415314275784926';

export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

/**
 * Load after hydration, not blocking or racing it: `next/script`'s `strategy`
 * values are configuration, not copy, but the value still has to come from
 * somewhere other than a literal in the component for the same reason every
 * other constant here does — one place to change it.
 */
export const ADSENSE_SCRIPT_STRATEGY = 'afterInteractive';

/** The `ads.txt` record, in the exact format the IAB spec expects. */
export const ADS_TXT_RECORD = 'google.com, pub-2415314275784926, DIRECT, f08c47fec0942fa0';
