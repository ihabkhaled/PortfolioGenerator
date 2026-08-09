import type { NormalizedResumeText } from '../types/ingestion.types';

/** Scanned CVs stay rejected until a bounded OCR provider actually exists. */
export function shouldRejectScannedResume(
  input: Pick<NormalizedResumeText, 'looksScanned'>,
): boolean {
  return input.looksScanned;
}
