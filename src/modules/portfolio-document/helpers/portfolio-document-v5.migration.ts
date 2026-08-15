import { companySchema } from '../schemas/portfolio-document.schema';

import { isRecord } from './portfolio-document-v2.migration';

/** Version 4 to 5 adds explicit companies and observed source page order. */
export function upgradeDocumentToVersion5(input: unknown): unknown {
  if (!isRecord(input)) return input;
  return {
    ...input,
    schemaVersion: 5,
    companies: Array.isArray(input['companies'])
      ? input['companies'].flatMap((company) => {
          const parsed = companySchema.safeParse(company);
          return parsed.success ? [parsed.data] : [];
        })
      : [],
    source: isRecord(input['source'])
      ? {
          ...input['source'],
          pageOrder: Array.isArray(input['source']['pageOrder'])
            ? input['source']['pageOrder']
            : null,
        }
      : input['source'],
  };
}
