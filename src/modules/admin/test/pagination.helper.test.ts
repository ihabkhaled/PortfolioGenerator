import { describe, expect, it } from 'vitest';

import {
  buildPagination,
  clampPage,
  computeOffset,
  computePageCount,
  parsePageParam,
} from '../helpers/pagination.helper';

describe('parsePageParam', () => {
  it('defaults to page one when the value is missing', () => {
    expect(parsePageParam(undefined)).toBe(1);
  });

  it('defaults to page one for a non-numeric value', () => {
    expect(parsePageParam('abc')).toBe(1);
  });

  it('defaults to page one for zero', () => {
    expect(parsePageParam('0')).toBe(1);
  });

  it('defaults to page one for a negative value', () => {
    expect(parsePageParam('-5')).toBe(1);
  });

  it('parses a valid page number', () => {
    expect(parsePageParam('3')).toBe(3);
  });

  it('truncates a fractional value', () => {
    expect(parsePageParam('4.9')).toBe(4);
  });
});

describe('computePageCount', () => {
  it('is one when there are no rows', () => {
    expect(computePageCount(0, 20)).toBe(1);
  });

  it('is one when there are negative rows', () => {
    expect(computePageCount(-5, 20)).toBe(1);
  });

  it('is exact when the count divides evenly', () => {
    expect(computePageCount(40, 20)).toBe(2);
  });

  it('rounds up a partial final page', () => {
    expect(computePageCount(41, 20)).toBe(3);
  });
});

describe('clampPage', () => {
  it('pulls a page above the count back to the last page', () => {
    expect(clampPage(9, 3)).toBe(3);
  });

  it('pulls a page below one up to the first page', () => {
    expect(clampPage(0, 3)).toBe(1);
  });

  it('leaves an in-range page untouched', () => {
    expect(clampPage(2, 3)).toBe(2);
  });
});

describe('computeOffset', () => {
  it('is zero on the first page', () => {
    expect(computeOffset(1, 20)).toBe(0);
  });

  it('advances by one page size per page', () => {
    expect(computeOffset(3, 20)).toBe(40);
  });
});

describe('buildPagination', () => {
  it('reports no previous or next page for an empty result', () => {
    expect(buildPagination({ page: 1, pageSize: 20, totalCount: 0 })).toEqual({
      page: 1,
      pageCount: 1,
      hasPrevious: false,
      hasNext: false,
    });
  });

  it('reports both directions available from a middle page', () => {
    expect(buildPagination({ page: 2, pageSize: 20, totalCount: 100 })).toEqual({
      page: 2,
      pageCount: 5,
      hasPrevious: true,
      hasNext: true,
    });
  });

  it('reports no next page on the last page, and clamps an out-of-range request', () => {
    expect(buildPagination({ page: 99, pageSize: 20, totalCount: 100 })).toEqual({
      page: 5,
      pageCount: 5,
      hasPrevious: true,
      hasNext: false,
    });
  });
});
