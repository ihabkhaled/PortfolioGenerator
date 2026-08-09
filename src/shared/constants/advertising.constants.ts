/**
 * The AdSense publisher id.
 *
 * Public by definition — it appears in `ads.txt`, in the loader URL and in a
 * meta tag — so it is a constant rather than an environment secret. Keeping it
 * in one place means the three places it has to agree cannot drift.
 */
export const ADSENSE_CLIENT_ID = 'ca-pub-2415314275784926';

export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;

/** The `ads.txt` record, in the exact format the IAB spec expects. */
export const ADS_TXT_RECORD = 'google.com, pub-2415314275784926, DIRECT, f08c47fec0942fa0';
