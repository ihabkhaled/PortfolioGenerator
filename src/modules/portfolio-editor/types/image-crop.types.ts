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
  readonly applyLabel: string;
  readonly cancelLabel: string;
}

export interface ImageCropPoint {
  readonly x: number;
  readonly y: number;
}
