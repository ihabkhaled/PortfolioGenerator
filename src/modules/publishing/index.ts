/** Public surface of the publishing module. */

export {
  RESERVED_SLUG_SEGMENTS,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_REJECTION_REASONS,
} from './constants/slug.constants';

export { isReservedSlug, normalizeSlug, suggestSlug, validateSlug } from './policies/slug.policy';

export type { SlugRejectionReason, SlugValidation } from './types/slug.types';
