import type { ReactElement } from 'react';

import { toStructuredDataMarkup } from '../helpers/structured-data.helper';
import type { StructuredDataProps } from '../types/structured-data.types';

/**
 * The `application/ld+json` block for a published portfolio.
 *
 * `dangerouslySetInnerHTML` is unavoidable and, here, correct: React escapes
 * text nodes, and an escaped `&quot;` inside a script body produces JSON no
 * crawler can parse. The safety property comes from `serializeStructuredData`
 * instead, which escapes `<` so a `</script>` sequence inside published content
 * cannot close the tag early. That escaping is the security boundary — this
 * component must never be handed a string built any other way.
 */
export function StructuredData(props: Readonly<StructuredDataProps>): ReactElement {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={toStructuredDataMarkup(props.json)} />
  );
}
