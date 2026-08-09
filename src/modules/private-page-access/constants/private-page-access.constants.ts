export const PRIVATE_PAGE_GRANT_MAX_AGE_SECONDS = 60 * 60;
export const PRIVATE_PAGE_ATTEMPT_LIMIT = 10;
export const PRIVATE_PAGE_ATTEMPT_WINDOW_SECONDS = 15 * 60;

export const PRIVATE_PAGE_PASSWORD_KEY_LENGTH = 32;
export const PRIVATE_PAGE_PASSWORD_SALT_LENGTH = 16;
export const PRIVATE_PAGE_PASSWORD_HASH_VERSION = 'scrypt-v1';
export const PRIVATE_PAGE_SCRYPT_COST = 16_384;
export const PRIVATE_PAGE_SCRYPT_BLOCK_SIZE = 8;
export const PRIVATE_PAGE_SCRYPT_PARALLELIZATION = 1;
export const PRIVATE_PAGE_SCRYPT_MAX_MEMORY = 64 * 1024 * 1024;

export const PRIVATE_PAGE_RESPONSE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet',
} as const;
