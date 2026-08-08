import type { CSSProperties } from 'react';

import { OG_COLORS } from './og-image.constants';

/**
 * Card layout, kept out of the component for the same reason every other style
 * bundle in this repository is: the visual language stays reviewable in one
 * place. Written as plain objects because satori accepts inline styles only.
 */
export const ogCardStyles = {
  canvas: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: OG_COLORS.canvas,
    padding: '72px',
  },
  accentBar: {
    display: 'flex',
    width: '120px',
    height: '8px',
    borderRadius: '4px',
    backgroundColor: OG_COLORS.accent,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
  },
  name: {
    display: 'flex',
    fontSize: '76px',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
    color: OG_COLORS.foreground,
  },
  headline: {
    display: 'flex',
    marginTop: '24px',
    fontSize: '34px',
    lineHeight: 1.3,
    color: OG_COLORS.muted,
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    borderTop: `2px solid ${OG_COLORS.border}`,
    paddingTop: '28px',
  },
  dot: {
    display: 'flex',
    width: '14px',
    height: '14px',
    borderRadius: '7px',
    marginRight: '16px',
    backgroundColor: OG_COLORS.accent,
  },
  url: {
    display: 'flex',
    fontSize: '28px',
    color: OG_COLORS.muted,
  },
} satisfies Record<string, CSSProperties>;
