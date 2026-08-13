/** Inputs to the pure page-count/offset maths, independent of any list's content. */
export interface PaginationParams {
  readonly page: number;
  readonly pageSize: number;
  readonly totalCount: number;
}

/**
 * The display-ready shape a pagination control needs.
 *
 * `page` is the requested page clamped into `[1, pageCount]` — never the raw,
 * possibly out-of-range value a query string can carry — so a control built
 * from this can never show "page 12 of 3".
 */
export interface PaginationResult {
  readonly page: number;
  readonly pageCount: number;
  readonly hasPrevious: boolean;
  readonly hasNext: boolean;
}
