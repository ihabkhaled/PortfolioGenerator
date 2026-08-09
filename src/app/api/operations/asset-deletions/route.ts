import {
  ASSET_DELETION_BATCH_SIZE,
  ASSET_DELETION_NO_STORE_HEADERS,
  isAuthorizedAssetDeletionCronRequest,
  retryDueAssetDeletions,
} from '@/modules/assets/server';
import { getServerEnv } from '@/packages/env/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const env = getServerEnv();

  if (
    !isAuthorizedAssetDeletionCronRequest(request.headers.get('authorization'), env.CRON_SECRET)
  ) {
    return Response.json(
      { error: 'unauthorized' },
      { status: 401, headers: ASSET_DELETION_NO_STORE_HEADERS },
    );
  }

  const processed = await retryDueAssetDeletions(new Date(), ASSET_DELETION_BATCH_SIZE);

  return Response.json({ processed }, { headers: ASSET_DELETION_NO_STORE_HEADERS });
}
