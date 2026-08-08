import type { ReactElement } from 'react';

import { ogCardStyles } from '../constants/og-card-style.constants';
import type { OgCardValues } from '../types/og-card.types';

/**
 * The 1200×630 share card.
 *
 * Inline styles, and a flat flex tree, because this is rendered by satori and
 * not by a browser: there is no cascade, no `className`, and only the subset of
 * flexbox satori implements. The design-system tokens cannot reach here either,
 * which is why the palette is a constant next door.
 *
 * The card shows what the portfolio itself leads with — name, headline, address
 * — and nothing the platform would rather advertise. A share of someone's
 * portfolio is their impression to make.
 */
export function PortfolioOgCard(props: Readonly<OgCardValues>): ReactElement {
  return (
    <div style={ogCardStyles.canvas}>
      <div style={ogCardStyles.accentBar} />
      <div style={ogCardStyles.body}>
        <div style={ogCardStyles.name}>{props.name}</div>
        {props.headline === null ? null : (
          <div style={ogCardStyles.headline}>{props.headline}</div>
        )}
      </div>
      <div style={ogCardStyles.footer}>
        <div style={ogCardStyles.dot} />
        <div style={ogCardStyles.url}>{props.url}</div>
      </div>
    </div>
  );
}
