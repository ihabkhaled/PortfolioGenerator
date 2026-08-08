export interface DeleteAccountLabels {
  readonly title: string;
  readonly hint: string;
  readonly confirmationLabel: string;
  readonly confirmationHelp: string;
  readonly submit: string;
  readonly submitting: string;
}

export interface DeletePortfolioProps {
  readonly portfolioId: string;
  readonly label: string;
  readonly confirmLabel: string;
  readonly cancelLabel: string;
  readonly submittingLabel: string;
  readonly confirmMessage: string;
}

export interface AccountSummaryProps {
  readonly title: string;
  readonly emailLabel: string;
  readonly email: string;
  readonly nameLabel: string;
  readonly name: string;
  readonly portfolioCountLabel: string;
  readonly portfolioCount: number;
}
