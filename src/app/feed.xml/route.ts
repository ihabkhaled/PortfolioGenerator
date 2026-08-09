import { getPublicRssFeed } from '@/modules/seo/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return new Response(await getPublicRssFeed(), {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=3600',
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
}
