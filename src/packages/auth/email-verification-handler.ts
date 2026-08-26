import 'server-only';

import { logger } from '@/packages/logger';

import {
  claimEmailVerificationToken,
  consumeEmailVerificationClaim,
  releaseEmailVerificationClaim,
  renewEmailVerificationClaim,
} from './email-verification-claim';
import { createAuthRouteHandlers } from './route-handlers';

const REJECTED_RESPONSE = { error: 'verification-rejected' } as const;
const CLAIM_RENEWAL_MS = 60 * 1000;

function rejected(): Response {
  return Response.json(REJECTED_RESPONSE, { status: 401 });
}

function isSuccessfulVerificationResponse(request: Request, response: Response): boolean {
  if (response.status >= 200 && response.status < 300) return true;
  if (response.status < 300 || response.status >= 400) return false;

  const location = response.headers.get('location');
  if (location === null) return false;

  try {
    return !new URL(location, request.url).searchParams.has('error');
  } catch {
    return false;
  }
}

export async function handleEmailVerificationRequest(request: Request): Promise<Response> {
  // This route serves email verification and nothing else, so a request that
  // carries no token cannot verify anything. Rejecting here keeps the
  // single-use claim on the only path that reaches Better Auth.
  const token = new URL(request.url).searchParams.get('token');
  if (!token) return rejected();

  let claim;
  try {
    claim = await claimEmailVerificationToken(token);
  } catch {
    logger.error('auth.email_verification_claim.failed');
    return rejected();
  }
  if (claim === null) return rejected();

  const renewal = setInterval(() => {
    void renewEmailVerificationClaim(claim).catch(() => {
      logger.error('auth.email_verification_claim_renewal.failed');
    });
  }, CLAIM_RENEWAL_MS);
  renewal.unref();

  try {
    const response = await createAuthRouteHandlers().GET(request);
    if (isSuccessfulVerificationResponse(request, response)) {
      return (await consumeEmailVerificationClaim(claim)) ? response : rejected();
    }

    return (await releaseEmailVerificationClaim(claim)) ? response : rejected();
  } catch (error) {
    try {
      await releaseEmailVerificationClaim(claim);
    } catch {
      logger.error('auth.email_verification_claim_release.failed');
    }
    throw error;
  } finally {
    clearInterval(renewal);
  }
}
