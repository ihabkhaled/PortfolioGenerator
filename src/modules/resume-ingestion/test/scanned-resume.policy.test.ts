import { describe, expect, it } from 'vitest';

import { shouldRejectScannedResume } from '../policies/scanned-resume.policy';

describe('shouldRejectScannedResume', () => {
  it('rejects a scanned document regardless of a legacy OCR flag', () => {
    expect(shouldRejectScannedResume({ looksScanned: true })).toBe(true);
  });

  it('keeps a document with a real text layer', () => {
    expect(shouldRejectScannedResume({ looksScanned: false })).toBe(false);
  });
});
