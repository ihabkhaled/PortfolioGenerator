import { isRecord } from './portfolio-document-v2.migration';

/** Version 3 to 4 adds optional, explicitly stated identity facts. */
export function upgradeDocumentToVersion4(input: unknown): unknown {
  if (!isRecord(input)) return input;

  const { identity } = input;

  return {
    ...input,
    schemaVersion: 4,
    identity: isRecord(identity)
      ? {
          ...identity,
          nationality: null,
          militaryStatus: null,
        }
      : identity,
  };
}
