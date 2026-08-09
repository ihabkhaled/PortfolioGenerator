import type { PrivatePageOwnerActionState } from '../types/private-page-owner.types';

export const PRIVATE_PAGE_PASSWORD_MIN_LENGTH = 12;
export const PRIVATE_PAGE_PASSWORD_MAX_LENGTH = 200;

export const PRIVATE_PAGE_OWNER_FIELDS = {
  portfolioId: 'portfolioId',
  pageId: 'pageId',
  expectedVersion: 'expectedVersion',
  visibility: 'visibility',
  password: 'password',
} as const;

export const PRIVATE_PAGE_OWNER_INITIAL_STATE: PrivatePageOwnerActionState = {
  status: 'idle',
  error: null,
  version: null,
};
