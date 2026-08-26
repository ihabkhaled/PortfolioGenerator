import { IDENTITY_SEGMENT_SEPARATORS } from '../constants/deterministic.constants';

/**
 * Read one explicitly labelled identity fact out of resume text.
 *
 * Each separated segment is considered on its own, so a header line that packs
 * several labels together yields the right value for each rather than handing
 * the whole remainder to the first one.
 */
export function extractExplicitIdentityValue(text: string, label: string): string | null {
  const prefix = `${label.toLowerCase()}:`;

  const segments = text
    .split('\n')
    .flatMap((line) => line.split(IDENTITY_SEGMENT_SEPARATORS))
    .map((segment) => segment.trim());

  for (const segment of segments) {
    if (!segment.toLowerCase().startsWith(prefix)) continue;

    const value = segment.slice(prefix.length).trim();

    if (value !== '') return value;
  }

  return null;
}
