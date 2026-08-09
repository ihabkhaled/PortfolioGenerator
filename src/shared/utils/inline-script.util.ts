import type { InlineScriptMarkup } from '@/shared/types/inline-script.types';

/**
 * Wrap a script body for `dangerouslySetInnerHTML`.
 *
 * Only ever called with a string this repository authored — the theme
 * bootstrap and the structured-data payload. `<` is escaped anyway, because a
 * script body is not escaped by React and a stray `</script>` would end the
 * element early.
 */
export function toInlineScript(body: string): InlineScriptMarkup {
  return { __html: body.replaceAll('</', String.raw`<\/`) };
}
