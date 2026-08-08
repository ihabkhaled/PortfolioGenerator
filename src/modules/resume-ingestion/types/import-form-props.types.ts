export interface ImportResumeFormProps {
  readonly portfolioId: string;
  /** Shown in the hint so the limits are visible before a failed upload. */
  readonly maxMegabytes: number;
  readonly maxPages: number;
}

export interface ImportFactRow {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface ImportFactListProps {
  readonly facts: readonly ImportFactRow[];
}
