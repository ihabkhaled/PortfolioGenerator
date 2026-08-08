import type { ResumeExtractionResult } from './ai-provider.types';

export interface ResumeSection {
  /** A key of `SECTION_HEADINGS`, or `header` for the text above the first one. */
  readonly heading: string;
  readonly lines: readonly string[];
}

/** A date range read off a single line of a CV. */
export interface ParsedDateRange {
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly current: boolean;
  /** False when the line was not a date range at all, so the caller can retry it as a role. */
  readonly matched: boolean;
}

/** Experience entries plus what could not be read while building them. */
export interface ParsedExperience {
  readonly entries: ResumeExtractionResult['experience'];
  readonly warnings: ResumeExtractionResult['warnings'];
}

/** The two halves of an `Organisation — Title` line, or nulls when unrecognised. */
export interface ParsedRoleLine {
  readonly organization: string | null;
  readonly title: string | null;
}
