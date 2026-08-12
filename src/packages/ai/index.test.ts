import { APICallError, InvalidToolInputError } from 'ai';
import type * as Ai from 'ai';
import { describe, expect, it, vi } from 'vitest';

import { z } from '@/packages/zod';

import type { StructuredRequest } from './ai.types';

import { createStructuredClient } from './index';

const generateText = vi.hoisted(() => vi.fn());

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof Ai>();
  return { ...actual, generateText };
});

/**
 * The catch block is the one place this client can misreport what actually
 * went wrong: it has to tell a malformed tool call — the model's fault, worth
 * retrying on a different model — apart from a network failure or provider
 * outage, which is nobody's fault and retrying on a costlier fallback model
 * would not fix. See ai-run-status.policy.ts for what reads this field.
 */

function buildRequest(): StructuredRequest {
  return {
    model: 'test-model',
    schema: z.object({ name: z.string() }),
    systemPrompt: 'system',
    userPrompt: 'user',
    maxOutputTokens: 100,
    timeoutMs: 1000,
  };
}

describe('createStructuredClient', () => {
  it('reports a malformed tool call as invalid-output', async () => {
    generateText.mockRejectedValueOnce(
      new InvalidToolInputError({
        toolInput: '{not json',
        toolName: 'report_extracted_data',
        cause: null,
      }),
    );
    const client = createStructuredClient({ apiKey: 'key', baseUrl: undefined });

    const result = await client(buildRequest());

    expect(result).toMatchObject({ ok: false, errorCode: 'invalid-output' });
  });

  it('reports a network failure as provider-error, not invalid-output', async () => {
    generateText.mockRejectedValueOnce(new TypeError('fetch failed'));
    const client = createStructuredClient({ apiKey: 'key', baseUrl: undefined });

    const result = await client(buildRequest());

    expect(result).toMatchObject({ ok: false, errorCode: 'provider-error' });
  });

  it('reports an exhausted provider quota separately from a transient provider failure', async () => {
    generateText.mockRejectedValueOnce(
      new APICallError({
        message: 'Resource exhausted',
        url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
        requestBodyValues: {},
        statusCode: 429,
      }),
    );
    const client = createStructuredClient({ apiKey: 'key', baseUrl: undefined });

    const result = await client(buildRequest());

    expect(result).toMatchObject({ ok: false, errorCode: 'quota-exceeded' });
  });

  it('reports a timed-out request as provider-error', async () => {
    generateText.mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'));
    const client = createStructuredClient({ apiKey: 'key', baseUrl: undefined });

    const result = await client(buildRequest());

    expect(result).toMatchObject({ ok: false, errorCode: 'provider-error' });
  });

  it('reports the model finishing without calling the forced tool as provider-error', async () => {
    generateText.mockResolvedValueOnce({
      toolCalls: [],
      usage: { inputTokens: 5, outputTokens: 1 },
    });
    const client = createStructuredClient({ apiKey: 'key', baseUrl: undefined });

    const result = await client(buildRequest());

    expect(result).toMatchObject({ ok: false, errorCode: 'provider-error' });
  });

  it('returns the tool call input on success', async () => {
    generateText.mockResolvedValueOnce({
      toolCalls: [{ input: { name: 'Amina' } }],
      usage: { inputTokens: 5, outputTokens: 1 },
    });
    const client = createStructuredClient({ apiKey: 'key', baseUrl: undefined });

    const result = await client(buildRequest());

    expect(result).toMatchObject({ ok: true, value: { name: 'Amina' } });
  });
});
