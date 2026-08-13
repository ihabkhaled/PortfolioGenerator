import { describe, expect, it } from 'vitest';

import { buildAdminAdminsListPath } from '../helpers/admin-admins-path.helper';

describe('buildAdminAdminsListPath', () => {
  it('returns the bare list path for an empty query and page 1', () => {
    expect(buildAdminAdminsListPath('', 1)).toBe('/managawy/admins');
  });

  it('returns the bare list path when the query is only whitespace', () => {
    expect(buildAdminAdminsListPath(' '.repeat(3), 1)).toBe('/managawy/admins');
  });

  it('carries a non-empty, trimmed query', () => {
    expect(buildAdminAdminsListPath('  amina  ', 1)).toBe('/managawy/admins?q=amina');
  });

  it('carries a page beyond the first', () => {
    expect(buildAdminAdminsListPath('', 3)).toBe('/managawy/admins?page=3');
  });

  it('carries both a query and a page beyond the first', () => {
    expect(buildAdminAdminsListPath('amina', 2)).toBe('/managawy/admins?q=amina&page=2');
  });
});
