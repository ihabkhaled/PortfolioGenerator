export const DOCUMENT_TEXT_CONTENT_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  rtf: 'application/rtf',
} as const;

export const MAX_DOCX_ENTRIES = 2000;
export const MAX_DOCX_UNCOMPRESSED_BYTES = 32 * 1024 * 1024;
export const MAX_DOCX_COMPRESSION_RATIO = 100;
export const ESTIMATED_CHARACTERS_PER_PAGE = 4000;

export const UNSAFE_DOCX_PATH_PARTS = [
  'vbaproject.bin',
  '/activex/',
  '/embeddings/',
  '/oleobject',
] as const;

export const UNSAFE_RTF_CONTROL_WORDS = [
  '\\object',
  '\\objdata',
  '\\pict',
  '\\datafield',
  '\\dde',
  '\\include',
] as const;

export const UNSAFE_OLE_MARKERS = ['VBA', 'Macros', 'ObjectPool', 'MsoDataStore'] as const;
