/** Machine-readable reasons, so the UI can say something specific per failure. */
export const FILE_REJECTIONS = {
  empty: 'empty',
  tooLarge: 'too-large',
  forbiddenExtension: 'forbidden-extension',
  unknownExtension: 'unknown-extension',
  unsupportedType: 'unsupported-type',
  signatureMismatch: 'signature-mismatch',
  extensionMismatch: 'extension-mismatch',
  imageUnreadable: 'image-unreadable',
  imageTooLarge: 'image-too-large',
  imageTooSmall: 'image-too-small',
  infected: 'infected',
  scannerUnavailable: 'scanner-unavailable',
} as const;

/** Scan verdicts recorded on the audit trail and shown in the editor. */
export const SCAN_OUTCOMES = ['clean', 'infected', 'skipped', 'unavailable'] as const;
