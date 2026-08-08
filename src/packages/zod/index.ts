/**
 * The single owning wrapper for Zod.
 *
 * Everything that crosses a trust boundary in this product — CV text, model
 * output, form submissions, stored JSON documents, environment variables —
 * is parsed here. Confining the vendor import to one file means a Zod major
 * upgrade is a one-file change, and it gives every caller the same failure
 * shape instead of a mix of `parse` throws and ad-hoc error handling.
 */

import { z, type ZodError, type ZodType } from 'zod';

import type { ParseIssue, ParseResult } from './zod.types';

export { z } from 'zod';
export type { ZodError, ZodType, infer as Infer } from 'zod';
export type { ParseFailure, ParseIssue, ParseResult, ParseSuccess } from './zod.types';

function toIssues(error: ZodError): readonly ParseIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    code: issue.code,
    message: issue.message,
  }));
}

/**
 * Parse without throwing. Callers get a discriminated result they must handle,
 * which is what makes "all model output is untrusted" enforceable rather than
 * aspirational.
 */
export function parseSchema<TSchema extends ZodType>(
  schema: TSchema,
  input: unknown,
): ParseResult<z.infer<TSchema>> {
  const result = schema.safeParse(input);

  if (result.success) {
    return { ok: true, value: result.data };
  }

  return { ok: false, issues: toIssues(result.error) };
}

/** Render parse issues as a single human-readable line for logs and errors. */
export function formatIssues(issues: readonly ParseIssue[]): string {
  return issues.map((issue) => `${issue.path || '(root)'}: ${issue.message}`).join('; ');
}

/** JSON Schema projection used to publish the canonical document contract. */
export function toJsonSchema(schema: ZodType): Record<string, unknown> {
  return z.toJSONSchema(schema, { io: 'output', unrepresentable: 'any' });
}
