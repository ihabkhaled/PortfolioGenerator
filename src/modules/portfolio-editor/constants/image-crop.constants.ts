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
