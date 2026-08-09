import { describe, expect, it } from 'vitest';

import { FILE_REJECTIONS } from '@/modules/file-security';
import { toUploadRejection, UPLOAD_REJECTIONS } from '@/modules/resume-ingestion';

/**
 * The seam between two vocabularies.
 *
 * File security knows about signatures and extensions; ingestion knows about
 * CVs. Mapping here keeps the import screen's message set closed, so a new
 * refusal reason in the security layer cannot reach a user as an untranslated
 * string.
 */

describe('toUploadRejection', () => {
  it.each([
    [FILE_REJECTIONS.empty, 'empty'],
    [FILE_REJECTIONS.tooLarge, 'too-large'],
    [FILE_REJECTIONS.infected, 'infected'],
    [FILE_REJECTIONS.scannerUnavailable, 'scanner-unavailable'],
  ])('carries %s across unchanged in meaning', (rejection, expected) => {
    expect(toUploadRejection(rejection)).toBe(expected);
  });

  // A user does not need to know whether the extension or the magic bytes
  // disagreed, only that the file is not what it claims. The precise reason
  // goes on the audit event.
  it.each([
    FILE_REJECTIONS.forbiddenExtension,
    FILE_REJECTIONS.unknownExtension,
    FILE_REJECTIONS.unsupportedType,
    FILE_REJECTIONS.signatureMismatch,
    FILE_REJECTIONS.extensionMismatch,
    FILE_REJECTIONS.imageUnreadable,
    FILE_REJECTIONS.imageTooLarge,
    FILE_REJECTIONS.imageTooSmall,
  ])('collapses %s to a type mismatch', (rejection) => {
    expect(toUploadRejection(rejection)).toBe('type-mismatch');
  });

  // "We could not scan it" and "we found something in it" are different facts,
  // and a user told the wrong one cannot act correctly.
  it('keeps an unavailable scanner distinct from an infected file', () => {
    expect(toUploadRejection(FILE_REJECTIONS.scannerUnavailable)).not.toBe(
      toUploadRejection(FILE_REJECTIONS.infected),
    );
  });

  it('only ever produces a rejection the import screen has a message for', () => {
    for (const rejection of Object.values(FILE_REJECTIONS)) {
      expect(UPLOAD_REJECTIONS).toContain(toUploadRejection(rejection));
    }
  });
});
