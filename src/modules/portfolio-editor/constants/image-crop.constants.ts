export const IMAGE_CROP_MIN_ZOOM = 1;
export const IMAGE_CROP_MAX_ZOOM = 3;

/**
 * A cropped photo is a fresh render every time — reusing the original file's
 * container format would mean re-deriving whether it can hold transparency,
 * for no benefit the crop output needs. JPEG at high quality is small and
 * universally supported.
 */
export const IMAGE_CROP_OUTPUT_MIME_TYPE = 'image/jpeg';
export const IMAGE_CROP_OUTPUT_QUALITY = 0.92;

/**
 * Only these reach an `<img>` preview. The crop surface renders the chosen file
 * directly, so anything that is not a decodable image is refused before a blob
 * URL is ever created for it.
 */
export const IMAGE_CROP_INPUT_MIME_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/avif',
];

export const IMAGE_CROP_INPUT_ACCEPT = IMAGE_CROP_INPUT_MIME_TYPES.join(',');
