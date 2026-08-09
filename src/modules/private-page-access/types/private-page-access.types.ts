export interface PrivatePageScope {
  readonly portfolioSlug: string;
  readonly pageId: string;
  readonly pageSlug: string;
}

export interface PrivatePageGrantInput {
  readonly scope: PrivatePageScope;
  readonly secret: string;
  readonly now?: Date;
  readonly maxAgeSeconds?: number;
}

export interface PrivatePageGrantVerificationInput extends PrivatePageGrantInput {
  readonly grant: string;
}

export interface PrivatePageUnlockInput extends PrivatePageGrantInput {
  readonly password: string;
  readonly passwordHash: string;
}

export interface PrivatePageUnlockSubmission {
  readonly portfolioSlug: string;
  readonly pageSlug: string;
  readonly password: string;
}

export interface PrivatePageCookieInput {
  readonly grant: string;
  readonly scope: PrivatePageScope;
  readonly secure: boolean;
  readonly maxAgeSeconds?: number;
}

export interface PrivatePageGrantPayload extends PrivatePageScope {
  readonly expiresAt: number;
}
