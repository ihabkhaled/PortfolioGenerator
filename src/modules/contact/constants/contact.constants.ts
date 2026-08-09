export const CONTACT_LIMIT = 3;
export const CONTACT_WINDOW_SECONDS = 3600;
export const CONTACT_REQUEST_MAX_BYTES = 16_384;
export const CONTACT_JSON_CONTENT_TYPE = 'application/json';
export const CONTACT_NO_STORE = 'no-store, max-age=0';

export const CONTACT_ERROR_STATUSES = ['invalid', 'rate-limited', 'unavailable'] as const;

export const CONTACT_HTTP_STATUS = {
  accepted: 202,
  invalid: 400,
  'rate-limited': 429,
  unavailable: 503,
} as const;
