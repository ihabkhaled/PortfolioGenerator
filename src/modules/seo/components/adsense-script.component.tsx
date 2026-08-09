import type { ReactElement } from 'react';

import { ADSENSE_SCRIPT_URL } from '@/shared/constants/advertising.constants';

import type { AdSenseScriptProps } from '../types/adsense.types';

export function AdSenseScript(props: AdSenseScriptProps): ReactElement {
  return <script async crossOrigin="anonymous" nonce={props.nonce} src={ADSENSE_SCRIPT_URL} />;
}
