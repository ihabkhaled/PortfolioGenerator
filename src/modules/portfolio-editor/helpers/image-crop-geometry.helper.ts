import type { ImageCropPoint, ZoomAroundViewportCenterInput } from '../types/image-crop.types';

export function zoomAroundViewportCenter(
  input: Readonly<ZoomAroundViewportCenterInput>,
): ImageCropPoint {
  const ratio = input.currentZoom > 0 ? input.nextZoom / input.currentZoom : 1;
  const centered = {
    x: input.viewport.width / 2 - (input.viewport.width / 2 - input.currentOffset.x) * ratio,
    y: input.viewport.height / 2 - (input.viewport.height / 2 - input.currentOffset.y) * ratio,
  };
  const minX = Math.min(0, input.viewport.width - input.nextRendered.width);
  const minY = Math.min(0, input.viewport.height - input.nextRendered.height);

  return {
    x: Math.min(0, Math.max(minX, centered.x)),
    y: Math.min(0, Math.max(minY, centered.y)),
  };
}
