import type { DocumentTextErrorCode } from './document-text.types';

export class DocumentTextError extends Error {
  readonly code: DocumentTextErrorCode;

  constructor(code: DocumentTextErrorCode) {
    super(code);
    this.name = 'DocumentTextError';
    this.code = code;
  }
}
