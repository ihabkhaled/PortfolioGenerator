/**
 * The provider label stored on every `ai_runs` row.
 *
 * Names the *shape* of the endpoint rather than a vendor, because the base URL
 * is configuration: the same adapter reaches OpenAI, a gateway, or a
 * self-hosted server, and a row saying "openai" when the traffic went to a
 * gateway would make the cost analysis wrong.
 */
export const MODEL_PROVIDER_NAME = 'openai-compatible';
