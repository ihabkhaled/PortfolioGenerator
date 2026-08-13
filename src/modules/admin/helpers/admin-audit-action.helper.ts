import type { TranslateFunction } from '@/packages/i18n';

import { ADMIN_AUDIT_ACTION_MESSAGE_KEYS } from '../constants/admin-audit-action.constants';

/**
 * A stored action code (`admin.two_factor.enrolled`) to human-readable copy.
 *
 * Falls back to the raw code for anything not in
 * `ADMIN_AUDIT_ACTION_MESSAGE_KEYS` — an audit log's job is to never hide a
 * row it cannot fully describe, so an action shipped after this map was
 * written still renders, just as its own code rather than a translated
 * label.
 */
export function resolveAdminAuditActionLabel(action: string, translate: TranslateFunction): string {
  const messageKey = ADMIN_AUDIT_ACTION_MESSAGE_KEYS[action];

  return messageKey === undefined ? action : translate(messageKey);
}
