import {
  RESUME_TEXT_CLOSE_TAG,
  RESUME_TEXT_OPEN_TAG,
} from '../constants/extraction-prompt.constants';

/**
 * Wrap the resume in the delimiter the extraction instruction refers to by
 * name.
 *
 * This is the prompt-injection boundary, and it lives with the provider that
 * builds a prompt rather than in the ingestion pipeline. Two reasons: the
 * envelope is meaningless to a provider that does not prompt — the offline
 * parser was previously reading the tags as CV content and emitting
 * "<resume_text>" as someone's name — and a boundary defined next to the
 * instruction that relies on it is one a reader can verify in one place.
 */
export function wrapResumeText(text: string): string {
  return `${RESUME_TEXT_OPEN_TAG}\n${text}\n${RESUME_TEXT_CLOSE_TAG}`;
}
