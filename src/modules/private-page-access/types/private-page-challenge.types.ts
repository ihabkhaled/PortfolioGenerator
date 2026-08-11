import type { SyntheticEvent } from 'react';

import type { AppLocale } from '@/modules/localization';

export interface PrivatePageChallengeLabels {
  readonly title: string;
  readonly description: string;
  readonly password: string;
  readonly submit: string;
  readonly denied: string;
}

export interface PrivatePageChallengeProps {
  readonly portfolioSlug: string;
  readonly pageSlug: string;
  readonly denied: boolean;
  readonly locale: AppLocale;
  readonly labels: PrivatePageChallengeLabels;
  readonly onSubmit?: (event: SyntheticEvent<HTMLFormElement>) => void;
  readonly pending?: boolean;
}
