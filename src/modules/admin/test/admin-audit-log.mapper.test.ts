import { describe, expect, it } from 'vitest';

import { toAdminAuditEventSummary } from '../mappers/admin-audit-log.mapper';
import type { AdminAuditEventRow } from '../types/admin-audit-log.types';

describe('toAdminAuditEventSummary', () => {
  const row: AdminAuditEventRow = {
    id: 'event-1',
    adminUserId: 'admin-1',
    adminName: 'Amina Karim',
    adminEmail: 'amina@example.com',
    targetType: 'USER',
    targetId: 'user-1',
    action: 'admin.user.suspended',
    metadata: { reason: 'abuse report' },
    createdAt: new Date('2026-02-01T12:30:00.000Z'),
  };

  it('narrows the row into a domain summary', () => {
    expect(toAdminAuditEventSummary(row)).toEqual({
      id: 'event-1',
      adminUserId: 'admin-1',
      adminName: 'Amina Karim',
      adminEmail: 'amina@example.com',
      targetType: 'USER',
      targetId: 'user-1',
      action: 'admin.user.suspended',
      metadata: { reason: 'abuse report' },
      createdAt: row.createdAt,
    });
  });

  it('carries a PORTFOLIO or ADMIN_USER target type through untouched', () => {
    expect(toAdminAuditEventSummary({ ...row, targetType: 'PORTFOLIO' }).targetType).toBe(
      'PORTFOLIO',
    );
    expect(toAdminAuditEventSummary({ ...row, targetType: 'ADMIN_USER' }).targetType).toBe(
      'ADMIN_USER',
    );
  });
});
