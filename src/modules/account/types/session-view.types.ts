/** One entry in a browser- or OS-detection table for `describeSessionDevice`. */
export interface SessionDeviceTokenPattern {
  readonly label: string;
  readonly test: RegExp;
}
