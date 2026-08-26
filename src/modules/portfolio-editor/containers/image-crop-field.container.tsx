'use client';
// client-boundary-reason: reading the chosen file, panning/zooming a canvas
// preview and producing the cropped blob are all interaction state a server
// component cannot hold.

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react';

import { Button, cn, Input, Select } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import {
  IMAGE_CROP_INPUT_ACCEPT,
  IMAGE_CROP_INPUT_MIME_TYPES,
  IMAGE_CROP_MAX_ZOOM,
  IMAGE_CROP_MIN_ZOOM,
  IMAGE_CROP_OUTPUT_MIME_TYPE,
  IMAGE_CROP_OUTPUT_QUALITY,
} from '../constants/image-crop.constants';
import { clampImageOffset, zoomAroundViewportCenter } from '../helpers/image-crop-geometry.helper';
import type { ImageCropFieldProps, ImageCropPoint, ImageCropSize } from '../types/image-crop.types';

function resolveImageBaseScale(
  bounds: ImageCropSize,
  natural: ImageCropSize,
  fitMode: 'crop' | 'full',
): number {
  const scales = [bounds.width / natural.width, bounds.height / natural.height];
  return fitMode === 'crop' ? Math.max(...scales) : Math.min(...scales);
}

/**
 * A file input that never lets an image through unframed.
 *
 * Cropping happens entirely client-side, before the surrounding form ever
 * submits: the visible `<input type="file">` keeps its `name`, so the
 * existing upload actions need no change. What actually reaches them is a
 * cropped, fixed-size file assembled onto a canvas and written back onto the
 * same input with `DataTransfer` — from the server's point of view, framing
 * is just part of choosing a file.
 */
export function ImageCropFieldContainer(props: Readonly<ImageCropFieldProps>): ReactElement {
  const {
    aspectRatio,
    shape,
    outputWidth,
    outputHeight,
    dialogTitle,
    zoomLabel,
    fitModeLabel,
    cropModeLabel,
    fullPhotoModeLabel,
    aspectRatioLabel,
    applyLabel,
    cancelLabel,
    ...inputProps
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{ pointer: ImageCropPoint; offset: ImageCropPoint } | null>(null);
  const baseScaleRef = useRef(1);

  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [baseScale, setBaseScale] = useState(1);
  const [zoom, setZoom] = useState(IMAGE_CROP_MIN_ZOOM);
  const [offset, setOffset] = useState<ImageCropPoint>({ x: 0, y: 0 });
  const [fitMode, setFitMode] = useState<'crop' | 'full'>('crop');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(aspectRatio);

  useEffect(() => {
    return () => {
      if (objectUrl !== null) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport === null || naturalSize === null || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      const bounds = viewport.getBoundingClientRect();
      const nextBaseScale = resolveImageBaseScale(bounds, naturalSize, fitMode);
      const currentBaseScale = baseScaleRef.current;
      if (Math.abs(nextBaseScale - currentBaseScale) < 0.000001) return;
      setOffset((current) =>
        zoomAroundViewportCenter({
          currentOffset: current,
          currentZoom: currentBaseScale * zoom,
          nextZoom: nextBaseScale * zoom,
          viewport: { width: bounds.width, height: bounds.height },
          nextRendered: {
            width: naturalSize.width * nextBaseScale * zoom,
            height: naturalSize.height * nextBaseScale * zoom,
          },
        }),
      );
      baseScaleRef.current = nextBaseScale;
      setBaseScale(nextBaseScale);
    });
    observer.observe(viewport);

    return () => {
      observer.disconnect();
    };
  }, [fitMode, naturalSize, zoom]);

  function clampOffset(candidate: ImageCropPoint, scale: number): ImageCropPoint {
    const viewport = viewportRef.current;

    if (viewport === null || naturalSize === null) {
      return candidate;
    }

    const rendered = {
      width: naturalSize.width * baseScale * scale,
      height: naturalSize.height * baseScale * scale,
    };
    const bounds = viewport.getBoundingClientRect();
    return clampImageOffset({
      offset: candidate,
      viewport: { width: bounds.width, height: bounds.height },
      rendered,
    });
  }

  function handleFileChosen(file: File): void {
    // Only a decodable image reaches the preview, so a blob URL is never made
    // for a file the crop surface cannot render.
    if (!IMAGE_CROP_INPUT_MIME_TYPES.includes(file.type)) return;

    setPendingFile(file);
    setObjectUrl((previous) => {
      if (previous !== null) {
        URL.revokeObjectURL(previous);
      }
      return URL.createObjectURL(file);
    });
    setZoom(IMAGE_CROP_MIN_ZOOM);
    dialogRef.current?.showModal();
  }

  function handleImageLoad(): void {
    const image = imageRef.current;
    const viewport = viewportRef.current;

    if (image === null || viewport === null) {
      return;
    }

    const bounds = viewport.getBoundingClientRect();
    const natural = { width: image.naturalWidth, height: image.naturalHeight };
    const cover = resolveImageBaseScale(bounds, natural, fitMode);

    setNaturalSize(natural);
    baseScaleRef.current = cover;
    setBaseScale(cover);
    setOffset({
      x: (bounds.width - natural.width * cover) / 2,
      y: (bounds.height - natural.height * cover) / 2,
    });
  }

  function handleZoomChange(nextZoom: number): void {
    const viewport = viewportRef.current;
    if (viewport !== null && naturalSize !== null) {
      const bounds = viewport.getBoundingClientRect();
      setOffset((current) =>
        zoomAroundViewportCenter({
          currentOffset: current,
          currentZoom: zoom,
          nextZoom,
          viewport: { width: bounds.width, height: bounds.height },
          nextRendered: {
            width: naturalSize.width * baseScale * nextZoom,
            height: naturalSize.height * baseScale * nextZoom,
          },
        }),
      );
    }
    setZoom(nextZoom);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>): void {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointer: { x: event.clientX, y: event.clientY }, offset };
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>): void {
    const drag = dragRef.current;

    if (drag === null) {
      return;
    }

    const next = {
      x: drag.offset.x + (event.clientX - drag.pointer.x),
      y: drag.offset.y + (event.clientY - drag.pointer.y),
    };

    setOffset(clampOffset(next, zoom));
  }

  function handlePointerUp(): void {
    dragRef.current = null;
  }

  function closeWithoutApplying(): void {
    dialogRef.current?.close();
    setPendingFile(null);
    setNaturalSize(null);

    if (inputRef.current !== null) {
      inputRef.current.value = '';
    }
  }

  function applyCrop(): void {
    const viewport = viewportRef.current;
    const image = imageRef.current;
    const canReadyToCrop =
      pendingFile !== null &&
      naturalSize !== null &&
      viewport !== null &&
      inputRef.current !== null &&
      image !== null;

    if (!canReadyToCrop) {
      return;
    }

    const bounds = viewport.getBoundingClientRect();
    const scale = baseScale * zoom;
    const sourceX = fitMode === 'full' ? 0 : -offset.x / scale;
    const sourceY = fitMode === 'full' ? 0 : -offset.y / scale;
    const sourceWidth = fitMode === 'full' ? naturalSize.width : bounds.width / scale;
    const sourceHeight = fitMode === 'full' ? naturalSize.height : bounds.height / scale;

    const canvas = globalThis.document.createElement('canvas');
    const requestedHeight =
      fitMode === 'full'
        ? Math.round(outputWidth / (naturalSize.width / naturalSize.height))
        : Math.round(outputWidth / selectedAspectRatio);
    canvas.height = Math.min(outputHeight, requestedHeight);
    const outputAspectRatio =
      fitMode === 'full' ? naturalSize.width / naturalSize.height : selectedAspectRatio;
    canvas.width =
      requestedHeight > outputHeight ? Math.round(outputHeight * outputAspectRatio) : outputWidth;
    const context = canvas.getContext('2d');

    if (context === null) {
      return;
    }

    context.drawImage(
      image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    canvas.toBlob(
      (blob) => {
        if (blob === null || inputRef.current === null) {
          return;
        }

        const fileName = pendingFile.name.replace(/\.\w+$/u, '.jpg');
        const cropped = new File([blob], fileName, { type: IMAGE_CROP_OUTPUT_MIME_TYPE });
        const transfer = new DataTransfer();
        transfer.items.add(cropped);
        inputRef.current.files = transfer.files;
        dialogRef.current?.close();
      },
      IMAGE_CROP_OUTPUT_MIME_TYPE,
      IMAGE_CROP_OUTPUT_QUALITY,
    );
  }

  return (
    <>
      <Input
        {...inputProps}
        ref={inputRef}
        type="file"
        accept={IMAGE_CROP_INPUT_ACCEPT}
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (file !== undefined) {
            handleFileChosen(file);
          }
        }}
      />

      <dialog ref={dialogRef} className={editorClasses.cropDialog} onCancel={closeWithoutApplying}>
        <div className={editorClasses.cropDialogFrame}>
          <p className={editorClasses.cropTitle}>{dialogTitle}</p>

          <div
            ref={viewportRef}
            role="region"
            aria-label={dialogTitle}
            className={cn(
              editorClasses.cropViewport,
              shape === 'circle' && fitMode === 'crop' && selectedAspectRatio === 1
                ? editorClasses.cropViewportCircle
                : editorClasses.cropViewportRect,
            )}
            style={{
              aspectRatio:
                fitMode === 'full' && naturalSize !== null
                  ? naturalSize.width / naturalSize.height
                  : selectedAspectRatio,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {objectUrl === null ? null : (
              <img
                ref={imageRef}
                src={objectUrl}
                alt=""
                className={editorClasses.cropSurface}
                style={
                  naturalSize === null
                    ? undefined
                    : {
                        width: naturalSize.width * baseScale * zoom,
                        height: naturalSize.height * baseScale * zoom,
                        transform: `translate(${offset.x}px, ${offset.y}px)`,
                      }
                }
                onLoad={handleImageLoad}
                draggable={false}
              />
            )}
          </div>

          <div className={editorClasses.cropZoomRow}>
            <label htmlFor={`${inputProps.id}-fit`}>{fitModeLabel}</label>
            <Select
              id={`${inputProps.id}-fit`}
              value={fitMode}
              onChange={(event) => {
                setFitMode(event.target.value as 'crop' | 'full');
                setZoom(IMAGE_CROP_MIN_ZOOM);
              }}
            >
              <option value="crop">{cropModeLabel}</option>
              <option value="full">{fullPhotoModeLabel}</option>
            </Select>
          </div>

          <div className={editorClasses.cropZoomRow}>
            <label htmlFor={`${inputProps.id}-aspect`}>{aspectRatioLabel}</label>
            <Select
              id={`${inputProps.id}-aspect`}
              value={String(selectedAspectRatio)}
              disabled={fitMode === 'full'}
              onChange={(event) => {
                setSelectedAspectRatio(Number(event.target.value));
              }}
            >
              <option value="1">1:1</option>
              <option value={String(4 / 3)}>4:3</option>
              <option value={String(16 / 9)}>16:9</option>
            </Select>
          </div>

          <div className={editorClasses.cropZoomRow}>
            <label htmlFor={`${inputProps.id}-zoom`}>{zoomLabel}</label>
            <input
              id={`${inputProps.id}-zoom`}
              type="range"
              min={IMAGE_CROP_MIN_ZOOM}
              max={IMAGE_CROP_MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(event) => {
                handleZoomChange(Number(event.target.value));
              }}
            />
          </div>

          <div className={editorClasses.cropActions}>
            <Button type="button" variant="secondary" onClick={closeWithoutApplying}>
              {cancelLabel}
            </Button>
            <Button type="button" onClick={applyCrop}>
              {applyLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
