import { describe, expect, it } from 'vitest';

import { zoomAroundViewportCenter } from '@/modules/portfolio-editor';

describe('zoomAroundViewportCenter', () => {
  it('keeps the viewport center over the same source point while zooming', () => {
    expect(
      zoomAroundViewportCenter({
        currentOffset: { x: -50, y: -25 },
        currentZoom: 1,
        nextZoom: 2,
        viewport: { width: 200, height: 100 },
        nextRendered: { width: 800, height: 400 },
      }),
    ).toEqual({ x: -200, y: -100 });
  });

  it.each([
    [
      { x: 20, y: 10 },
      { x: 0, y: 0 },
    ],
    [
      { x: -900, y: -500 },
      { x: -600, y: -300 },
    ],
  ])('clamps offsets to every rendered edge', (currentOffset, expected) => {
    expect(
      zoomAroundViewportCenter({
        currentOffset,
        currentZoom: 1,
        nextZoom: 1,
        viewport: { width: 200, height: 100 },
        nextRendered: { width: 800, height: 400 },
      }),
    ).toEqual(expected);
  });

  it('handles a centered cover image at minimum zoom', () => {
    expect(
      zoomAroundViewportCenter({
        currentOffset: { x: -100, y: 0 },
        currentZoom: 1,
        nextZoom: 1,
        viewport: { width: 200, height: 200 },
        nextRendered: { width: 400, height: 200 },
      }),
    ).toEqual({ x: -100, y: 0 });
  });

  it('centers a contained image instead of pinning it to the top-left', () => {
    expect(
      zoomAroundViewportCenter({
        currentOffset: { x: 0, y: 0 },
        currentZoom: 1,
        nextZoom: 1,
        viewport: { width: 200, height: 200 },
        nextRendered: { width: 100, height: 200 },
      }),
    ).toEqual({ x: 50, y: 0 });
  });

  it('keeps the current focal point when the current scale is zero', () => {
    expect(
      zoomAroundViewportCenter({
        currentOffset: { x: -20, y: -10 },
        currentZoom: 0,
        nextZoom: 2,
        viewport: { width: 200, height: 100 },
        nextRendered: { width: 400, height: 200 },
      }),
    ).toEqual({ x: -20, y: -10 });
  });
});
