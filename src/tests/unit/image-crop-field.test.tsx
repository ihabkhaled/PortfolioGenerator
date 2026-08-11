import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ImageCropFieldContainer } from '@/modules/portfolio-editor/editor-ui';

class TestDataTransfer {
  readonly files: File[] = [];
  readonly items = {
    add: (file: File): void => {
      this.files.push(file);
    },
  };
}

const props = {
  id: 'portrait',
  name: 'file',
  'aria-label': 'Portrait',
  accept: 'image/*',
  aspectRatio: 1,
  shape: 'circle' as const,
  outputWidth: 400,
  outputHeight: 400,
  dialogTitle: 'Crop portrait',
  zoomLabel: 'Zoom',
  applyLabel: 'Apply crop',
  cancelLabel: 'Cancel',
};

const resizeHarness: { notify: () => void } = { notify: () => {} };

class TestResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeHarness.notify = () => {
      callback([], this as unknown as ResizeObserver);
    };
  }
  observe(): void {}
  disconnect(): void {}
}

function setCropGeometry(width = 200, height = 200): void {
  const viewport = screen.getByRole('region', { name: 'Crop portrait' });
  const image = screen.getByRole('presentation');

  viewport.setPointerCapture = vi.fn();
  Object.defineProperty(viewport, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      width,
      height,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
      toJSON: () => ({}),
    }),
  });
  Object.defineProperties(image, {
    naturalWidth: { configurable: true, value: 400 },
    naturalHeight: { configurable: true, value: 200 },
  });
  fireEvent.load(image);
}

describe('image crop field', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperties(URL, {
      createObjectURL: { configurable: true, value: vi.fn(() => 'blob:portrait') },
      revokeObjectURL: { configurable: true, value: vi.fn() },
    });
    Object.defineProperty(globalThis, 'DataTransfer', {
      configurable: true,
      value: TestDataTransfer,
    });
    resizeHarness.notify = (): void => {};
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
  });

  it('opens for a chosen image, supports framing, and cancels cleanly', async () => {
    const user = userEvent.setup();
    const view = render(<ImageCropFieldContainer {...props} />);
    const input = screen.getByLabelText<HTMLInputElement>('Portrait');
    const first = new File(['one'], 'one.png', { type: 'image/png' });
    const second = new File(['two'], 'two.png', { type: 'image/png' });

    await user.upload(input, first);
    expect(URL.createObjectURL).toHaveBeenCalledWith(first);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce();

    await user.upload(input, second);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:portrait');

    setCropGeometry();
    const viewport = screen.getByRole('region', { name: 'Crop portrait' });
    await user.click(screen.getByLabelText('Zoom'));
    await user.keyboard('{ArrowRight}');
    await user.pointer([
      { keys: '[MouseLeft>]', target: viewport, coords: { clientX: 10, clientY: 10 } },
      { target: viewport, coords: { clientX: -20, clientY: -20 } },
      { keys: '[/MouseLeft]', target: viewport },
    ]);
    fireEvent.pointerCancel(viewport);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledOnce();
    expect(input).toHaveValue('');

    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:portrait');
  });

  it('replaces the selected file with the generated crop', async () => {
    const user = userEvent.setup();
    const drawImage = vi.fn();
    const toBlob = vi.fn((callback: BlobCallback) => {
      callback(new Blob(['crop']));
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      drawImage,
    } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation(toBlob);

    render(<ImageCropFieldContainer {...props} shape="rect" aspectRatio={2} />);
    const input = screen.getByLabelText<HTMLInputElement>('Portrait');
    await user.upload(input, new File(['one'], 'portrait.png', { type: 'image/png' }));
    setCropGeometry(200, 100);
    Object.defineProperty(input, 'files', {
      configurable: true,
      writable: true,
      value: input.files,
    });

    await user.click(screen.getByRole('button', { name: 'Apply crop' }));

    expect(drawImage).toHaveBeenCalledOnce();
    expect(toBlob).toHaveBeenCalledOnce();
    expect(input.files?.[0]?.name).toBe('portrait.jpg');
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledOnce();
  });

  it('re-clamps the focal point when the responsive viewport resizes', async () => {
    const user = userEvent.setup();
    render(<ImageCropFieldContainer {...props} />);
    await user.upload(
      screen.getByLabelText<HTMLInputElement>('Portrait'),
      new File(['one'], 'portrait.png', { type: 'image/png' }),
    );
    setCropGeometry();
    const viewport = screen.getByRole('region', { name: 'Crop portrait' });
    Object.defineProperty(viewport, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 700, height: 400 }),
    });
    act(() => {
      resizeHarness.notify();
    });

    expect(screen.getByRole('presentation')).toHaveStyle({
      width: '800px',
      height: '400px',
      transform: 'translate(-100px, 0px)',
    });
  });

  it('recomputes cover scale when a resize changes the viewport aspect ratio', async () => {
    const user = userEvent.setup();
    render(<ImageCropFieldContainer {...props} />);
    await user.upload(
      screen.getByLabelText<HTMLInputElement>('Portrait'),
      new File(['x'], 'p.png', { type: 'image/png' }),
    );
    setCropGeometry();
    const viewport = screen.getByRole('region', { name: 'Crop portrait' });
    Object.defineProperty(viewport, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 100, height: 300 }),
    });

    act(() => {
      resizeHarness.notify();
    });

    expect(screen.getByRole('presentation')).toHaveStyle({
      width: '600px',
      height: '300px',
      transform: 'translate(-175px, 0px)',
    });
  });

  it('leaves the original choice alone when crop prerequisites disappear', async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    const view = render(<ImageCropFieldContainer {...props} />);
    await user.click(screen.getByRole('button', { name: 'Apply crop', hidden: true }));

    const input = screen.getByLabelText<HTMLInputElement>('Portrait');
    await user.upload(input, new File(['one'], 'portrait.png', { type: 'image/png' }));
    setCropGeometry();
    await user.click(screen.getByRole('button', { name: 'Apply crop' }));

    expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledOnce();
    view.unmount();
  });
});
