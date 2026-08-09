import type { FILE_REJECTIONS } from '../constants/file-security.constants';

export type FileRejection = (typeof FILE_REJECTIONS)[keyof typeof FILE_REJECTIONS];

export type FileKind = 'document' | 'image';

export interface UploadCandidate {
  readonly fileName: string;
  /** What the browser claimed. A hint, never a decision. */
  readonly declaredContentType: string;
  readonly bytes: Uint8Array;
}

export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

/**
 * What the pipeline concluded.
 *
 * The accepted content type is the one derived from the *bytes*, not the one
 * the browser sent, so everything downstream — the storage record, the download
 * header — describes what the file actually is.
 */
export type FileInspection =
  | {
      readonly ok: true;
      readonly contentType: string;
      readonly extension: string;
      readonly dimensions: ImageDimensions | null;
    }
  | { readonly ok: false; readonly rejection: FileRejection; readonly detail: string | null };

/** A format's identity: what it is called, and what it looks like on disk. */
export interface FileFormat {
  readonly extensions: readonly string[];
  readonly signature: string;
}

export type FileFormatTable = Readonly<Record<string, FileFormat>>;
