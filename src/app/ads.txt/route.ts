import { ADS_TXT_RECORD } from '@/shared/constants/advertising.constants';

export function GET(): Response {
  return new Response(ADS_TXT_RECORD, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
