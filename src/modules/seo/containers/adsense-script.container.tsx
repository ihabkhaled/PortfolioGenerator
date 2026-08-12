'use client';
// client-boundary-reason: AdSense must be appended after hydration without
// Next.js adding the unsupported data-nscript attribute.

import { useEffect } from 'react';

import { ADSENSE_SCRIPT_URL } from '@/shared/constants/advertising.constants';

import type { AdSenseScriptProps } from '../types/adsense.types';

export function AdSenseScript(props: AdSenseScriptProps): null {
  useEffect(() => {
    const scripts = globalThis.document.querySelectorAll('script');
    if ([...scripts].some((script) => script.src === ADSENSE_SCRIPT_URL)) return;

    const script = globalThis.document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    if (props.nonce !== undefined) script.nonce = props.nonce;
    script.src = ADSENSE_SCRIPT_URL;
    globalThis.document.head.append(script);
  }, [props.nonce]);

  return null;
}
