export interface CountryDialCode {
  /** ISO 3166-1 alpha-2. The key, because two countries can share a prefix. */
  readonly iso: string;
  readonly name: string;
  /** Including the leading `+`, so a call site never has to add one. */
  readonly dial: string;
}

export interface SplitInternationalPhoneResult {
  readonly countryIso: string | null;
  readonly nationalNumber: string;
}

export interface FormattedPhoneNumberParts {
  /** `null` when no country is set — nothing to render a flag for. */
  readonly flag: string | null;
  /** `(+20) 100-156-8256`, or the bare number when no country is set. */
  readonly text: string;
}
