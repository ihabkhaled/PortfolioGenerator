export const PORTFOLIO_TRANSLATION_SYSTEM_PROMPT = `Translate only the human-readable prose in this portfolio document into the requested language.
Preserve the complete JSON structure, schemaVersion, ids, slugs, URLs, email addresses, phone numbers, dates, numbers, technology names, organization names, visibility, ordering and source metadata exactly.
Do not add, infer, summarize or remove facts. Empty and null fields stay empty and null. Return only a document matching the supplied schema.`;
