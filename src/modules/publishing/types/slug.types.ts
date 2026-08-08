import type { SLUG_REJECTION_REASONS } from '../constants/slug.constants';

export type SlugRejectionReason =
  (typeof SLUG_REJECTION_REASONS)[keyof typeof SLUG_REJECTION_REASONS];

export type SlugValidation =
  | { readonly ok: true; readonly slug: string }
  | { readonly ok: false; readonly reason: SlugRejectionReason };
