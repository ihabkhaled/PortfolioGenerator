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
  readonly labels: PrivatePageChallengeLabels;
}
