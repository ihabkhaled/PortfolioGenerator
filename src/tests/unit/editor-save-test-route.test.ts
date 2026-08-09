import { beforeEach, describe, expect, it, vi } from 'vitest';

import { POST } from '@/app/api/test/editor-save/route';

const { environment, saveDraftAction } = vi.hoisted(() => ({
  environment: { NODE_ENV: 'test', NEXT_PUBLIC_APP_ENV: 'local' },
  saveDraftAction: vi.fn(),
}));

vi.mock('@/modules/portfolio-editor/server', () => ({ saveDraftAction }));
vi.mock('@/packages/env/server', () => ({ getServerEnv: () => environment }));

beforeEach(() => {
  environment.NODE_ENV = 'test';
  environment.NEXT_PUBLIC_APP_ENV = 'local';
  saveDraftAction.mockReset();
});

describe('test editor-save route', () => {
  it('returns not found in public production even when the runtime is test', async () => {
    environment.NEXT_PUBLIC_APP_ENV = 'production';

    const response = await POST(
      new Request('http://localhost/api/test/editor-save', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    );

    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: 'not-found' });
    expect(saveDraftAction).not.toHaveBeenCalled();
  });
});
