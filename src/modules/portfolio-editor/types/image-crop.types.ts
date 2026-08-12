import type { InputProps } from '@/packages/ui-primitives';

export interface ImageCropFieldProps extends Readonly<
  Omit<InputProps, 'type' | 'onChange' | 'value'>
> {
  /** Width divided by height of the crop frame and the output file. */
  readonly aspectRatio: number;
  readonly shape: 'rect' | 'circle';
  readonly outputWidth: number;
  readonly outputHeight: number;
  readonly dialogTitle: string;
  readonly zoomLabel: string;
  readonly fitModeLabel: string;
  readonly cropModeLabel: string;
  readonly fullPhotoModeLabel: string;
  readonly aspectRatioLabel: string;
  readonly applyLabel: string;
  readonly cancelLabel: string;
}

export interface ImageCropPoint {
  readonly x: number;
  readonly y: number;
}

export interface ImageCropSize {
  readonly width: number;
  readonly height: number;
}

export interface ZoomAroundViewportCenterInput {
  readonly currentOffset: ImageCropPoint;
  readonly currentZoom: number;
  readonly nextZoom: number;
  readonly viewport: ImageCropSize;
  readonly nextRendered: ImageCropSize;
}
