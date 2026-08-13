import { describe, expect, it } from 'vitest';

import {
  buildAdminAuditLogActionOptions,
  buildAdminAuditLogAdminOptions,
  buildAdminAuditLogListHref,
  buildAdminAuditLogRowView,
  buildAdminAuditLogTargetTypeOptions,
  buildAdminAuditMetadataEntries,
  buildAdminAuditTargetHref,
  formatAdminAuditLogTimestamp,
  formatAdminAuditMetadataValue,
  isAdminAuditLogTargetTypeFilter,
  parseAdminAuditLogTargetTypeFilter,
  sanitizeAdminAuditLogFilterValue,
  sanitizeAdminAuditLogQuery,
} from '../helpers/admin-audit-log-view.helper';
import type {
  AdminAuditEventSummary,
  AdminAuditLogAdminOption,
} from '../types/admin-audit-log.types';

const translate = (key: string, values?: Readonly<Record<string, string | number>>): string =>
  values === undefined ? key : `${key}:${JSON.stringify(values)}`;

describe('isAdminAuditLogTargetTypeFilter', () => {
  it('accepts every known filter value', () => {
    expect(isAdminAuditLogTargetTypeFilter('ALL')).toBe(true);
    expect(isAdminAuditLogTargetTypeFilter('USER')).toBe(true);
    expect(isAdminAuditLogTargetTypeFilter('PORTFOLIO')).toBe(true);
    expect(isAdminAuditLogTargetTypeFilter('ADMIN_USER')).toBe(true);
  });

  it('rejects an unknown value', () => {
    expect(isAdminAuditLogTargetTypeFilter('NOPE')).toBe(false);
  });
});

describe('parseAdminAuditLogTargetTypeFilter', () => {
  it('defaults to ALL when the value is missing', () => {
    expect(parseAdminAuditLogTargetTypeFilter(undefined)).toBe('ALL');
  });

  it('defaults to ALL for an unknown value', () => {
    expect(parseAdminAuditLogTargetTypeFilter('nope')).toBe('ALL');
  });

  it('accepts a known filter', () => {
    expect(parseAdminAuditLogTargetTypeFilter('PORTFOLIO')).toBe('PORTFOLIO');
  });
});

describe('sanitizeAdminAuditLogQuery', () => {
  it('is empty when the value is missing', () => {
    expect(sanitizeAdminAuditLogQuery(undefined)).toBe('');
  });

  it('trims surrounding whitespace', () => {
    expect(sanitizeAdminAuditLogQuery('  portfolio-1  ')).toBe('portfolio-1');
  });

  it('bounds an excessively long value', () => {
    expect(sanitizeAdminAuditLogQuery('a'.repeat(500))).toHaveLength(200);
  });
});

describe('sanitizeAdminAuditLogFilterValue', () => {
  it('is undefined when the value is missing', () => {
    expect(sanitizeAdminAuditLogFilterValue(undefined)).toBeUndefined();
  });

  it('is undefined for a blank value', () => {
    expect(sanitizeAdminAuditLogFilterValue(' '.repeat(3))).toBeUndefined();
  });

  it('is undefined for the "all" sentinel', () => {
    expect(sanitizeAdminAuditLogFilterValue('ALL')).toBeUndefined();
  });

  it('trims and keeps a real value', () => {
    expect(sanitizeAdminAuditLogFilterValue('  admin-1  ')).toBe('admin-1');
  });

  it('bounds an excessively long value', () => {
    expect(sanitizeAdminAuditLogFilterValue('a'.repeat(500))).toHaveLength(200);
  });
});

describe('buildAdminAuditLogListHref', () => {
  it('is the bare path when every filter is at its default', () => {
    expect(
      buildAdminAuditLogListHref(
        { query: '', adminUserId: undefined, targetType: 'ALL', action: undefined },
        1,
      ),
    ).toBe('/managawy/audit-log');
  });

  it('carries a trimmed search term', () => {
    expect(
      buildAdminAuditLogListHref(
        { query: '  portfolio-1  ', adminUserId: undefined, targetType: 'ALL', action: undefined },
        1,
      ),
    ).toBe('/managawy/audit-log?q=portfolio-1');
  });

  it('carries an admin filter', () => {
    expect(
      buildAdminAuditLogListHref(
        { query: '', adminUserId: 'admin-1', targetType: 'ALL', action: undefined },
        1,
      ),
    ).toBe('/managawy/audit-log?admin=admin-1');
  });

  it('carries a non-default target type', () => {
    expect(
      buildAdminAuditLogListHref(
        { query: '', adminUserId: undefined, targetType: 'PORTFOLIO', action: undefined },
        1,
      ),
    ).toBe('/managawy/audit-log?targetType=PORTFOLIO');
  });

  it('carries an action filter', () => {
    expect(
      buildAdminAuditLogListHref(
        { query: '', adminUserId: undefined, targetType: 'ALL', action: 'admin.user.suspended' },
        1,
      ),
    ).toBe('/managawy/audit-log?action=admin.user.suspended');
  });

  it('carries a page beyond the first', () => {
    expect(
      buildAdminAuditLogListHref(
        { query: '', adminUserId: undefined, targetType: 'ALL', action: undefined },
        3,
      ),
    ).toBe('/managawy/audit-log?page=3');
  });

  it('combines every non-default filter and the page', () => {
    expect(
      buildAdminAuditLogListHref(
        {
          query: 'portfolio-1',
          adminUserId: 'admin-1',
          targetType: 'USER',
          action: 'admin.user.suspended',
        },
        2,
      ),
    ).toBe(
      '/managawy/audit-log?q=portfolio-1&admin=admin-1&targetType=USER&action=admin.user.suspended&page=2',
    );
  });
});

describe('buildAdminAuditLogTargetTypeOptions', () => {
  it('translates every known target type in order', () => {
    expect(buildAdminAuditLogTargetTypeOptions(translate)).toEqual([
      { value: 'ALL', label: 'auditLog.filters.allTargetTypes' },
      { value: 'USER', label: 'auditLog.targetTypes.USER' },
      { value: 'PORTFOLIO', label: 'auditLog.targetTypes.PORTFOLIO' },
      { value: 'ADMIN_USER', label: 'auditLog.targetTypes.ADMIN_USER' },
    ]);
  });
});

describe('buildAdminAuditLogAdminOptions', () => {
  it('leads with "all admins" when no admin has recorded an event', () => {
    expect(buildAdminAuditLogAdminOptions([], translate)).toEqual([
      { value: 'ALL', label: 'auditLog.filters.allAdmins' },
    ]);
  });

  it('appends every admin, labelled with name and email', () => {
    const admins: readonly AdminAuditLogAdminOption[] = [
      { id: 'admin-1', name: 'Amina Karim', email: 'amina@example.com' },
      { id: 'admin-2', name: 'Sam Iyer', email: 'sam@example.com' },
    ];

    expect(buildAdminAuditLogAdminOptions(admins, translate)).toEqual([
      { value: 'ALL', label: 'auditLog.filters.allAdmins' },
      { value: 'admin-1', label: 'Amina Karim (amina@example.com)' },
      { value: 'admin-2', label: 'Sam Iyer (sam@example.com)' },
    ]);
  });
});

describe('buildAdminAuditLogActionOptions', () => {
  it('leads with "all actions" when no action has been recorded', () => {
    expect(buildAdminAuditLogActionOptions([], translate)).toEqual([
      { value: 'ALL', label: 'auditLog.filters.allActions' },
    ]);
  });

  it('appends every action code, humanized where known and raw where not', () => {
    expect(
      buildAdminAuditLogActionOptions(['admin.user.suspended', 'admin.rbac.updated'], translate),
    ).toEqual([
      { value: 'ALL', label: 'auditLog.filters.allActions' },
      { value: 'admin.user.suspended', label: 'auditLog.actions.userSuspended' },
      { value: 'admin.rbac.updated', label: 'admin.rbac.updated' },
    ]);
  });
});

describe('formatAdminAuditMetadataValue', () => {
  it('renders null as the literal string', () => {
    expect(formatAdminAuditMetadataValue(null)).toBe('null');
  });

  it('renders a string as-is', () => {
    expect(formatAdminAuditMetadataValue('amina')).toBe('amina');
  });

  it('renders a number', () => {
    expect(formatAdminAuditMetadataValue(42)).toBe('42');
  });

  it('renders a boolean', () => {
    expect(formatAdminAuditMetadataValue(true)).toBe('true');
  });

  it('renders a nested value as JSON', () => {
    expect(formatAdminAuditMetadataValue({ nested: true })).toBe('{"nested":true}');
  });
});

describe('buildAdminAuditMetadataEntries', () => {
  it('is empty for null metadata', () => {
    expect(buildAdminAuditMetadataEntries(null)).toEqual([]);
  });

  it('is empty for a non-object payload', () => {
    expect(buildAdminAuditMetadataEntries('not an object')).toEqual([]);
  });

  it('is empty for an array payload', () => {
    expect(buildAdminAuditMetadataEntries(['a', 'b'])).toEqual([]);
  });

  it('is empty for an empty object', () => {
    expect(buildAdminAuditMetadataEntries({})).toEqual([]);
  });

  it('lists every key of a scalar-valued object', () => {
    expect(buildAdminAuditMetadataEntries({ slug: 'amina', uploads: 2, ownerId: null })).toEqual([
      { key: 'slug', value: 'amina' },
      { key: 'uploads', value: '2' },
      { key: 'ownerId', value: 'null' },
    ]);
  });
});

describe('formatAdminAuditLogTimestamp', () => {
  it('formats a date as YYYY-MM-DD HH:mm in UTC', () => {
    expect(formatAdminAuditLogTimestamp(new Date('2026-02-01T12:34:56.000Z'))).toBe(
      '2026-02-01 12:34',
    );
  });
});

describe('buildAdminAuditTargetHref', () => {
  it('links to the user detail page for a USER target', () => {
    expect(buildAdminAuditTargetHref('USER', 'user-1')).toBe('/managawy/users/user-1');
  });

  it('has no link for a PORTFOLIO target', () => {
    expect(buildAdminAuditTargetHref('PORTFOLIO', 'portfolio-1')).toBeNull();
  });

  it('has no link for an ADMIN_USER target', () => {
    expect(buildAdminAuditTargetHref('ADMIN_USER', 'admin-1')).toBeNull();
  });
});

describe('buildAdminAuditLogRowView', () => {
  const summary: AdminAuditEventSummary = {
    id: 'event-1',
    adminUserId: 'admin-1',
    adminName: 'Amina Karim',
    adminEmail: 'amina@example.com',
    targetType: 'USER',
    targetId: 'user-1',
    action: 'admin.user.suspended',
    metadata: { reason: 'abuse report' },
    createdAt: new Date('2026-02-01T12:34:00.000Z'),
  };

  it('builds a fully resolved row', () => {
    expect(buildAdminAuditLogRowView(summary, translate)).toEqual({
      id: 'event-1',
      whenLabel: '2026-02-01 12:34',
      whenIso: '2026-02-01T12:34:00.000Z',
      adminLabel: 'Amina Karim (amina@example.com)',
      actionLabel: 'auditLog.actions.userSuspended',
      actionCode: 'admin.user.suspended',
      targetTypeLabel: 'auditLog.targetTypes.USER',
      targetId: 'user-1',
      targetHref: '/managawy/users/user-1',
      metadataEntries: [{ key: 'reason', value: 'abuse report' }],
    });
  });
});
