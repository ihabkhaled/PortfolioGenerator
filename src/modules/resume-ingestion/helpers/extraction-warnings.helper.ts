import { WARNING_TEXT_MAX_LENGTH } from '@/shared/constants/security.constants';

import type { ExtractionWarning } from '../types/ingestion.types';

/**
 * Read the warnings JSONB column back into a renderable list.
 *
 * The column is `unknown` to the type system and could hold anything a past
 * build wrote, so each entry is shape-checked and bounded rather than cast.
 * These strings are rendered to a user, and a stored value that is not a string
 * — or is a megabyte long — should degrade to "no warnings" rather than to a
 * broken page.
 */
export function readExtractionWarnings(value: unknown): readonly ExtractionWarning[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (entry): entry is Record<string, unknown> => typeof entry === 'object' && entry !== null,
    )
    .map((entry) => ({
      code: readBoundedString(entry['code']),
      path: readBoundedString(entry['path']),
      message: readBoundedString(entry['message']),
    }))
    .filter((warning) => warning.message !== '');
}

export function readBoundedString(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, WARNING_TEXT_MAX_LENGTH) : '';
}
