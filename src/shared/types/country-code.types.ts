export interface CountryDialCode {
  /** ISO 3166-1 alpha-2. The key, because two countries can share a prefix. */
  readonly iso: string;
  readonly name: string;
  /** Including the leading `+`, so a call site never has to add one. */
  readonly dial: string;
}
