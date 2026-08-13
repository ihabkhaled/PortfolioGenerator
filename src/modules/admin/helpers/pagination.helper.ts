import { PAGINATION_FIRST_PAGE } from '../constants/pagination.constants';
import type { PaginationParams, PaginationResult } from '../types/pagination.types';

/**
 * A raw `page` query-string value to a safe page number.
 *
 * Missing, non-numeric, fractional-truncated-to-zero, or negative all become
 * page one — the same "typo in the URL lands somewhere sane" contract a
 * search box gets for free, applied to pagination.
 */
export function parsePageParam(value: string | undefined): number {
  if (value === undefined) {
    return PAGINATION_FIRST_PAGE;
  }

  const parsed = Math.trunc(Number(value));

  return Number.isFinite(parsed) && parsed >= PAGINATION_FIRST_PAGE
    ? parsed
    : PAGINATION_FIRST_PAGE;
}

/** How many pages a list of `totalCount` rows spans at `pageSize` per page. Never less than one. */
export function computePageCount(totalCount: number, pageSize: number): number {
  return totalCount <= 0 ? PAGINATION_FIRST_PAGE : Math.ceil(totalCount / pageSize);
}

/** Pull a requested page back into the range a list of `pageCount` pages actually has. */
export function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(page, PAGINATION_FIRST_PAGE), pageCount);
}

/** The row offset a clamped, 1-indexed page starts at. */
export function computeOffset(page: number, pageSize: number): number {
  return (page - PAGINATION_FIRST_PAGE) * pageSize;
}

/** The full page-count/offset maths a pagination control needs, in one call. */
export function buildPagination(params: PaginationParams): PaginationResult {
  const pageCount = computePageCount(params.totalCount, params.pageSize);
  const page = clampPage(params.page, pageCount);

  return {
    page,
    pageCount,
    hasPrevious: page > PAGINATION_FIRST_PAGE,
    hasNext: page < pageCount,
  };
}
