import type { PUBLISH_BLOCKERS, PUBLISH_FAILURES } from '../constants/publish.constants';

export type PublishBlocker = (typeof PUBLISH_BLOCKERS)[keyof typeof PUBLISH_BLOCKERS];
export type PublishFailure = (typeof PUBLISH_FAILURES)[keyof typeof PUBLISH_FAILURES];

export interface PublishRequest {
  readonly ownerId: string;
  readonly portfolioId: string;
  readonly now: Date;
}

export type PublishOutcome =
  | { readonly ok: true; readonly slug: string; readonly publishedVersion: number }
  | {
      readonly ok: false;
      readonly failure: PublishFailure;
      readonly blockers?: readonly PublishBlocker[];
    };

export interface SlugAvailability {
  readonly slug: string;
  readonly available: boolean;
  /** Present when the slug is not usable at all, as opposed to merely taken. */
  readonly rejection: string | null;
}
