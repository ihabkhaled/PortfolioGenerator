import type { NextRequest } from 'next/server';

import { getOwnedAssetBytes, OWNED_ASSET_RESPONSE_HEADERS } from '@/modules/assets/server';
import { getCurrentUser } from '@/modules/auth/server';

export const dynamic = 'force-dynamic';

/**
 * The editor's own live preview reads asset bytes from here, not from
 * `/media/[assetId]` — that route only serves what is part of a published
 * snapshot, so a portrait or gallery photo on a draft that has never been
 * published, or was edited since the last publish, has nothing to be read
 * from there. This route trusts session ownership instead of publish state.
 *
 * `getCurrentUser` rather than `requireOwner`: this is a binary-response
 * route an `<img>` tag fetches, not a page, so a missing session becomes a
 * 404 like every other authorization failure here — not a redirect to a
 * sign-in page, which a browser would just render as a second broken image.
 */
export async function GET(
  _request: NextRequest,
  context: { readonly params: Promise<{ portfolioId: string; assetId: string }> },
): Promise<Response> {
  const owner = await getCurrentUser();
  const { portfolioId, assetId } = await context.params;
  const found = owner === null ? null : await getOwnedAssetBytes(owner.id, portfolioId, assetId);

  if (found === null) {
    return new Response(null, { status: 404, headers: OWNED_ASSET_RESPONSE_HEADERS });
  }

  const headers = new Headers(OWNED_ASSET_RESPONSE_HEADERS);
  headers.set('Content-Type', found.asset.contentType);
  headers.set('Content-Length', String(found.bytes.length));
  headers.set('X-Content-Type-Options', 'nosniff');

  return new Response(Buffer.from(found.bytes), { headers });
}
