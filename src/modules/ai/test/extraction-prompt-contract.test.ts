import { describe, expect, it } from 'vitest';

import { RESUME_EXTRACTION_SYSTEM_PROMPT } from '../constants/extraction-prompt.constants';

describe('resume extraction prompt contract', () => {
  it('requires explicit evidence for nationality and military status', () => {
    expect(RESUME_EXTRACTION_SYSTEM_PROMPT).toMatch(
      /Preserve nationality or military\s+status only when the resume states it explicitly/u,
    );
  });

  it('treats overlapping work intervals as valid without a warning', () => {
    expect(RESUME_EXTRACTION_SYSTEM_PROMPT).toMatch(
      /Overlapping experience dates are valid\. Do not warn merely because/u,
    );
  });

  it('keeps unsupported portfolio content bounded and reviewable', () => {
    expect(RESUME_EXTRACTION_SYSTEM_PROMPT).toMatch(
      /Testimonials and media stay empty unless the document directly contains/u,
    );
    expect(RESUME_EXTRACTION_SYSTEM_PROMPT).toMatch(
      /code\s+UNSUPPORTED_CONTENT, the section path, and a short review instruction/u,
    );
    expect(RESUME_EXTRACTION_SYSTEM_PROMPT).toMatch(
      /Return pageOrder only as this ordered list of known slugs/u,
    );
    expect(RESUME_EXTRACTION_SYSTEM_PROMPT).toMatch(
      /When a field is absent or unclear, use null or an empty array and add one\s+short warning/u,
    );
  });
});
