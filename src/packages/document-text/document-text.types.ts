export type DocumentContentType =
  | 'application/pdf'
  | 'application/msword'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  | 'application/rtf';

export type DocumentContainerKind = 'doc' | 'docx' | 'rtf';

export type DocumentTextErrorCode =
  'corrupt-document' | 'too-many-pages' | 'unsafe-container' | 'unsupported-type';

export interface DocumentTextInput {
  readonly bytes: Uint8Array;
  readonly contentType: string;
  readonly maxCharacters: number;
  readonly maxPages: number;
}

export interface DocumentTextResult {
  readonly text: string;
  readonly pageCount: number;
  readonly wasTruncated: boolean;
}

export interface DocxFixtureOptions {
  readonly macro?: boolean;
  readonly externalRelationship?: boolean;
}
