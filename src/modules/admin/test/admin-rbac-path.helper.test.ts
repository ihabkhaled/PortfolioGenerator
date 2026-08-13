import { describe, expect, it } from 'vitest';

import { buildAdminRbacListPath } from '../helpers/admin-rbac-path.helper';

describe('buildAdminRbacListPath', () => {
  it('returns the bare path with no query, page one, and no selected admin', () => {
    expect(buildAdminRbacListPath('', 1, null)).toBe('/managawy/rbac');
  });

  it('omits an empty-string admin id the same as null', () => {
    expect(buildAdminRbacListPath('', 1, '')).toBe('/managawy/rbac');
  });

  it('trims and includes a search query', () => {
    expect(buildAdminRbacListPath('  ada  ', 1, null)).toBe('/managawy/rbac?q=ada');
  });

  it('includes a page beyond page one', () => {
    expect(buildAdminRbacListPath('', 3, null)).toBe('/managawy/rbac?page=3');
  });

  it('includes a selected admin id', () => {
    expect(buildAdminRbacListPath('', 1, 'admin-1')).toBe('/managawy/rbac?adminId=admin-1');
  });

  it('combines query, page and selected admin id together', () => {
    expect(buildAdminRbacListPath('ada', 2, 'admin-1')).toBe(
      '/managawy/rbac?q=ada&page=2&adminId=admin-1',
    );
  });

  it('omits an all-whitespace admin id the same as null', () => {
    expect(buildAdminRbacListPath('', 1, ' '.repeat(3))).toBe('/managawy/rbac');
  });
});
