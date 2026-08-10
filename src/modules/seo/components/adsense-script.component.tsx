import Script from 'next/script';
import type { ReactElement } from 'react';

import { ADSENSE_SCRIPT_URL } from '@/shared/constants/advertising.constants';

import type { AdSenseScriptProps } from '../types/adsense.types';

/**
 * `next/script` with `afterInteractive` rather than a raw `<script>` tag: it
 * injects the tag itself once the page has hydrated, so the two sides of
 * hydration never have to agree on where in `<head>` a third-party script
 * that has nothing to do with the render sits. A raw tag alongside the theme
 * script above made that comparison — server and client disagreeing on which
 * of the two occupied a given position — a real, reproducible mismatch.
 */
export function AdSenseScript(props: AdSenseScriptProps): ReactElement {
  return (
    <Script
      async
      crossOrigin="anonymous"
      nonce={props.nonce}
      src={ADSENSE_SCRIPT_URL}
      strategy="afterInteractive"
    />
  );
}
