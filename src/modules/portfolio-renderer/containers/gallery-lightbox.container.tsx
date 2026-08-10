'use client';
// client-boundary-reason: which image is showing full-size, and the native
// <dialog> it opens in, are interaction state a server component cannot hold.

import { useRef, useState, type ReactElement } from 'react';

import { CloseIcon } from '@/packages/icons';
import { AppImage } from '@/packages/image';

import { supplementalClasses } from '../constants/template-style.constants';
import type { GalleryLightboxItem, GalleryLightboxProps } from '../types/gallery-lightbox.types';

/**
 * A grid of thumbnails that each open the same image full-size in a native
 * `<dialog>` — chosen over a hand-built overlay because it gets focus
 * trapping, Escape-to-close and a `::backdrop` for free, in exchange for
 * nothing this gallery needs that a bespoke implementation would do better.
 *
 * The dialog's own `onClick` closing it on a backdrop click is the standard
 * React pattern for a native `<dialog>`: `currentTarget` is the dialog itself
 * (where the listener is bound) and `target` is whatever was actually
 * clicked, so they are equal only when the click landed on the dialog's own
 * padding rather than a child. Escape already closes it natively — this only
 * adds the equivalent mouse gesture, not a new way in.
 */
export function GalleryLightboxContainer(props: Readonly<GalleryLightboxProps>): ReactElement {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<GalleryLightboxItem | null>(null);

  const open = (item: GalleryLightboxItem): void => {
    setActive(item);
    dialogRef.current?.showModal();
  };

  return (
    <div className={supplementalClasses.gallery}>
      {props.items.map((item) => (
        <figure key={item.id} className={supplementalClasses.figure}>
          <button
            type="button"
            className={supplementalClasses.galleryTrigger}
            onClick={() => {
              open(item);
            }}
          >
            <AppImage
              src={item.src}
              alt={item.alt}
              width={640}
              height={480}
              className={supplementalClasses.galleryImage}
            />
          </button>
          {item.caption === null ? null : (
            <figcaption className={supplementalClasses.caption}>{item.caption}</figcaption>
          )}
        </figure>
      ))}

      <dialog
        ref={dialogRef}
        className={supplementalClasses.lightboxDialog}
        onClick={(event) => {
          if (event.currentTarget === event.target) {
            dialogRef.current?.close();
          }
        }}
        onClose={() => {
          setActive(null);
        }}
      >
        {active === null ? null : (
          <div className={supplementalClasses.lightboxFrame}>
            <button
              type="button"
              className={supplementalClasses.lightboxClose}
              aria-label={props.closeLabel}
              onClick={() => {
                dialogRef.current?.close();
              }}
            >
              <CloseIcon aria-hidden size={18} />
            </button>
            <AppImage
              src={active.src}
              alt={active.alt}
              width={1600}
              height={1200}
              className={supplementalClasses.lightboxImage}
            />
            {active.caption === null ? null : (
              <p className={supplementalClasses.lightboxCaption}>{active.caption}</p>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
