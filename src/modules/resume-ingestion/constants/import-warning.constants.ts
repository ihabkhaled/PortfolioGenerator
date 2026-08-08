/**
 * Warnings the pipeline itself raises, before or around the model call.
 *
 * Kept separate from the AI module's codes so the ingestion module does not
 * have to import from it: the two produce warnings for different reasons and
 * the editor renders both the same way.
 */
export const WARNING_CODES = {
  truncatedInput: 'TRUNCATED_INPUT',
  scannedDocument: 'SCANNED_DOCUMENT',
} as const;
