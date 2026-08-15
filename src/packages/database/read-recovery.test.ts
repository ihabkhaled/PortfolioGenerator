import { describe, expect, it, vi } from 'vitest';

import { executeDatabaseRead } from './read-recovery';

describe('executeDatabaseRead', () => {
  it('retries a connection-closed read once after reset', async () => {
    const read = vi.fn().mockRejectedValueOnce({ code: 'P1017' }).mockResolvedValue('ok');
    const reset = vi.fn().mockResolvedValue(undefined);

    await expect(executeDatabaseRead(read, reset)).resolves.toBe('ok');
    expect(read).toHaveBeenCalledTimes(2);
    expect(reset).toHaveBeenCalledOnce();
  });

  it('propagates the second connection failure and never retries other errors', async () => {
    const connectionError = new Error('ConnectionClosed');
    const read = vi.fn().mockRejectedValue(connectionError);
    const reset = vi.fn().mockResolvedValue(undefined);

    await expect(executeDatabaseRead(read, reset)).rejects.toBe(connectionError);
    expect(read).toHaveBeenCalledTimes(2);

    const other = new Error('syntax error');
    const noRetry = vi.fn().mockRejectedValue(other);
    await expect(executeDatabaseRead(noRetry, reset)).rejects.toBe(other);
    expect(noRetry).toHaveBeenCalledOnce();
  });
});
