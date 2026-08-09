import { saveDraftSchema } from '@/modules/portfolio-editor';
import { saveDraftAction } from '@/modules/portfolio-editor/server';
import { getServerEnv } from '@/packages/env/server';
import { parseSchema } from '@/packages/zod';

export async function POST(request: Request): Promise<Response> {
  const env = getServerEnv();
  if (env.NODE_ENV !== 'test' || env.NEXT_PUBLIC_APP_ENV === 'production')
    return Response.json({ error: 'not-found' }, { status: 404 });
  const payload: unknown = await request.json();
  const parsed = parseSchema(saveDraftSchema, payload);
  if (!parsed.ok) return Response.json({ error: 'rejected' }, { status: 404 });
  const result = await saveDraftAction(parsed.value);
  return result.status === 'saved'
    ? Response.json({ status: 'saved', version: result.version })
    : Response.json({ error: 'rejected' }, { status: 404 });
}
