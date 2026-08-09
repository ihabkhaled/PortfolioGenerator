/**
 * What each accepted format actually looks like on disk.
 *
 * The browser-reported MIME type is a claim by the uploader's software and is
 * trivially forged; the extension is a claim by the uploader. The bytes are the
 * only part of an upload that has to be true for the file to work at all, so
 * they decide.
 *
 * Offsets matter: WebP and AVIF both carry their marker inside a container
 * header rather than at byte zero, and a check that only looked at the first
 * four bytes would call every RIFF file a WebP.
 */
export const FILE_SIGNATURES = [
  { format: 'pdf', parts: [{ offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] }] },
  {
    format: 'png',
    parts: [{ offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  },
  { format: 'jpeg', parts: [{ offset: 0, bytes: [0xff, 0xd8, 0xff] }] },
  { format: 'gif', parts: [{ offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] }] },
  // Two parts, both required: RIFF is a container, and matching only its header
  // would call every WAV and AVI a WebP.
  {
    format: 'webp',
    parts: [
      { offset: 0, bytes: [0x52, 0x49, 0x46, 0x46] },
      { offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
    ],
  },
  {
    format: 'avif',
    parts: [
      { offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] },
      { offset: 8, bytes: [0x61, 0x76, 0x69, 0x66] },
    ],
  },
  // Modern Office files are ZIP containers; DOC is an OLE2 compound file.
  { format: 'zip', parts: [{ offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] }] },
  {
    format: 'ole2',
    parts: [{ offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1] }],
  },
] as const;

/**
 * The formats a CV may be uploaded in, and what each one has to look like.
 *
 * PDF first, because it is the only one that renders identically everywhere.
 * DOC and DOCX are accepted because a large share of CVs still exist only in
 * them, and telling someone to convert their own CV before using the product is
 * a worse answer than reading it.
 */
export const DOCUMENT_FORMATS = {
  'application/pdf': { extensions: ['.pdf'], signature: 'pdf' },
  'application/msword': { extensions: ['.doc'], signature: 'ole2' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    extensions: ['.docx'],
    signature: 'zip',
  },
  'application/rtf': { extensions: ['.rtf'], signature: 'rtf' },
} as const;

/**
 * The image formats a gallery or a portrait may use.
 *
 * SVG is deliberately absent. It is a document format that can carry script and
 * external references, and "an image the browser executes" is not a category
 * this product accepts from an untrusted uploader.
 */
export const IMAGE_FORMATS = {
  'image/png': { extensions: ['.png'], signature: 'png' },
  'image/jpeg': { extensions: ['.jpg', '.jpeg'], signature: 'jpeg' },
  'image/webp': { extensions: ['.webp'], signature: 'webp' },
  'image/gif': { extensions: ['.gif'], signature: 'gif' },
  'image/avif': { extensions: ['.avif'], signature: 'avif' },
} as const;

/** RTF has no binary magic; it opens with a literal control word. */
export const RTF_PREFIX = '{\\rtf';

/** Extensions that are never accepted, whatever the bytes say. */
export const FORBIDDEN_EXTENSIONS = [
  '.exe',
  '.dll',
  '.scr',
  '.bat',
  '.cmd',
  '.com',
  '.msi',
  '.js',
  '.mjs',
  '.jar',
  '.sh',
  '.ps1',
  '.vbs',
  '.svg',
  '.html',
  '.htm',
  '.xhtml',
  '.php',
  '.py',
  '.rb',
] as const;

/**
 * A decompression ceiling for ZIP-shaped uploads.
 *
 * A DOCX is a ZIP, and a ZIP can claim to hold far more than it does. The
 * pipeline never decompresses one, but the ratio is recorded so a future reader
 * knows the bound was considered rather than forgotten.
 */
export const MAX_IMAGE_PIXELS = 40_000_000;
export const MAX_IMAGE_DIMENSION = 12_000;
export const MIN_IMAGE_DIMENSION = 8;
