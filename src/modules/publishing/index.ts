/** Public surface of the publishing module. */

export {
  RESERVED_SLUG_SEGMENTS,
  SLUG_MAX_LENGTH,
  SLUG_MIN_LENGTH,
  SLUG_REJECTION_REASONS,
} from './constants/slug.constants';

export { PUBLISH_BLOCKERS, PUBLISH_FAILURES } from './constants/publish.constants';
export {
  findPublishBlockers,
  hasAnyContent,
  isPublishable,
} from './policies/publish-readiness.policy';
export { isReservedSlug, normalizeSlug, suggestSlug, validateSlug } from './policies/slug.policy';

export type {
  PublishBlocker,
  PublishFailure,
  PublishOutcome,
  PublishRequest,
  SlugAvailability,
} from './types/publish.types';
export type { SlugRejectionReason, SlugValidation } from './types/slug.types';
