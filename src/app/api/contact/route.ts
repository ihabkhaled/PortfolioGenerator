import {
  CONTACT_JSON_CONTENT_TYPE,
  CONTACT_NO_STORE,
  CONTACT_REQUEST_MAX_BYTES,
} from '@/modules/contact';
import { CONTACT_HTTP_STATUS, sendContactMessage } from '@/modules/contact/server';
import { getClientAddress } from '@/packages/headers';

export async function POST(request: Request): Promise<Response> {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
  const declaredLength = Number(request.headers.get('content-length') ?? 0);

  if (
    contentType !== CONTACT_JSON_CONTENT_TYPE ||
    !Number.isFinite(declaredLength) ||
    declaredLength > CONTACT_REQUEST_MAX_BYTES
  ) {
    return Response.json(
      { status: 'invalid' },
      {
        status: CONTACT_HTTP_STATUS.invalid,
        headers: { 'Cache-Control': CONTACT_NO_STORE },
      },
    );
  }

  let input: unknown;
  try {
    const body = await request.text();

    if (body.length > CONTACT_REQUEST_MAX_BYTES) {
      throw new Error('contact body too large');
    }

    input = JSON.parse(body);
  } catch {
    return Response.json(
      { status: 'invalid' },
      {
        status: CONTACT_HTTP_STATUS.invalid,
        headers: { 'Cache-Control': CONTACT_NO_STORE },
      },
    );
  }

  const result = await sendContactMessage(input, {
    address: await getClientAddress(),
    now: new Date(),
  });

  return Response.json(result, {
    status: CONTACT_HTTP_STATUS[result.status],
    headers: { 'Cache-Control': CONTACT_NO_STORE },
  });
}
