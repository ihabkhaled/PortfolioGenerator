import type { NextRequest } from 'next/server';

import { getPublishedAssetBytesUnscoped } from '@/modules/assets/server';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  context: { readonly params: Promise<{ readonly assetId: string }> },
): Promise<Response> {
  const { assetId } = await context.params;
  const found = await getPublishedAssetBytesUnscoped(assetId);

  if (found === null) {
    return new Response(null, {
      status: 404,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }

  const disposition = found.asset.contentType.startsWith('image/') ? 'inline' : 'attachment';
  const encodedName = encodeURIComponent(found.asset.originalFilename);

  return new Response(Buffer.from(found.bytes), {
    headers: {
      // Assets are owner-deletable. A year-long immutable CDN entry would keep
      // serving a removed CV or photograph after its database row was gone.
      'Cache-Control': 'private, no-store',
      'Content-Disposition': `${disposition}; filename*=UTF-8''${encodedName}`,
      'Content-Length': String(found.bytes.length),
      'Content-Type': found.asset.contentType,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
