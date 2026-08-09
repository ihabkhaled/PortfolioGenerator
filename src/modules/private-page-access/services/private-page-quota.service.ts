import 'server-only';

import { getRateLimiter } from '@/modules/rate-limit/server';
import { sha256Hex } from '@/packages/cryptography';

import {
  PRIVATE_PAGE_ATTEMPT_LIMIT,
  PRIVATE_PAGE_ATTEMPT_WINDOW_SECONDS,
} from '../constants/private-page-access.constants';
import type { PrivatePageScope } from '../types/private-page-access.types';

export async function consumePrivatePageUnlockQuota(
  address: string,
  scope: PrivatePageScope,
  now: Date,
): Promise<boolean> {
  const subject = sha256Hex(`${address}\u{0}${scope.portfolioSlug}\u{0}${scope.pageId}`);
  const attempt = await getRateLimiter().consume({
    // Page-scoped throttling prevents one attacked share from locking visitors
    // out of unrelated portfolios reached through the same NAT.
    bucket: `private-page:attempt:${subject}`,
    limit: PRIVATE_PAGE_ATTEMPT_LIMIT,
    windowSeconds: PRIVATE_PAGE_ATTEMPT_WINDOW_SECONDS,
    now,
  });

  return attempt.allowed;
}
