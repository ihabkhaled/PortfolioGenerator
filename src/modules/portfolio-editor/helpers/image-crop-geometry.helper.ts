import type {
  ClampImageOffsetInput,
  ImageCropPoint,
  ZoomAroundViewportCenterInput,
} from '../types/image-crop.types';

export function clampImageOffset(input: Readonly<ClampImageOffsetInput>): ImageCropPoint {
  return {
    x:
      input.rendered.width <= input.viewport.width
        ? (input.viewport.width - input.rendered.width) / 2
        : Math.min(0, Math.max(input.viewport.width - input.rendered.width, input.offset.x)),
    y:
      input.rendered.height <= input.viewport.height
        ? (input.viewport.height - input.rendered.height) / 2
        : Math.min(0, Math.max(input.viewport.height - input.rendered.height, input.offset.y)),
  };
}

export function zoomAroundViewportCenter(
  input: Readonly<ZoomAroundViewportCenterInput>,
): ImageCropPoint {
  const ratio = input.currentZoom > 0 ? input.nextZoom / input.currentZoom : 1;
  const centered = {
    x: input.viewport.width / 2 - (input.viewport.width / 2 - input.currentOffset.x) * ratio,
    y: input.viewport.height / 2 - (input.viewport.height / 2 - input.currentOffset.y) * ratio,
  };
  return clampImageOffset({
    offset: centered,
    viewport: input.viewport,
    rendered: input.nextRendered,
  });
}
