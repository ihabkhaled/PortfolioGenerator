'use client';
// client-boundary-reason: both upload forms retain owner-written labels while
// their server actions scan and store the selected file.

import { useActionState, useEffect, useRef, useState, type ReactElement } from 'react';

import { ASSET_UPLOAD_INITIAL_STATE } from '@/modules/assets';
import type { PortfolioDocument } from '@/modules/portfolio-document';
import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button, Input, Label, Select } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import { EDITOR_ATTACHMENT_KINDS } from '../constants/editor.constants';
import type { AssetCollectionsUploadProps } from '../types/asset-collections-upload.types';

export function AssetCollectionsUploadContainer(
  props: Readonly<AssetCollectionsUploadProps>,
): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.editor);
  const [galleryState, galleryAction, isGalleryPending] = useActionState(
    props.uploadAction,
    ASSET_UPLOAD_INITIAL_STATE,
  );
  const [attachmentState, attachmentAction, isAttachmentPending] = useActionState(
    props.uploadAction,
    ASSET_UPLOAD_INITIAL_STATE,
  );
  const [alt, setAlt] = useState('');
  const [caption, setCaption] = useState('');
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<PortfolioDocument['attachments'][number]['kind']>('cv');
  const handledGallery = useRef<string | null>(null);
  const handledAttachment = useRef<string | null>(null);

  useEffect(() => {
    if (galleryState.status !== 'success' || handledGallery.current === galleryState.asset.id)
      return;
    handledGallery.current = galleryState.asset.id;
    props.onGalleryUploaded(galleryState.asset, alt, caption);
  }, [alt, caption, galleryState, props]);

  useEffect(() => {
    if (
      attachmentState.status !== 'success' ||
      handledAttachment.current === attachmentState.asset.id
    )
      return;
    handledAttachment.current = attachmentState.asset.id;
    props.onAttachmentUploaded(attachmentState.asset, kind, label);
  }, [attachmentState, kind, label, props]);

  return (
    <section className={editorClasses.section} aria-labelledby="asset-collections-title">
      <div className={editorClasses.sectionHead}>
        <h2 id="asset-collections-title" className={editorClasses.sectionTitle}>
          {t('assets.collectionsTitle')}
        </h2>
      </div>
      <p className={editorClasses.sectionHint}>{t('assets.collectionsHint')}</p>

      <form action={galleryAction} className={editorClasses.collection}>
        <input type="hidden" name="portfolioId" value={props.portfolioId} />
        <input type="hidden" name="purpose" value="gallery" />
        <div className={editorClasses.field}>
          <Label htmlFor="gallery-asset">{t('assets.galleryFile')}</Label>
          <Input
            id="gallery-asset"
            name="asset"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            required
          />
        </div>
        <div className={editorClasses.field}>
          <Label htmlFor="gallery-alt">{t('assets.galleryAlt')}</Label>
          <Input
            id="gallery-alt"
            value={alt}
            onChange={(event) => {
              setAlt(event.target.value);
            }}
            required
          />
        </div>
        <div className={editorClasses.field}>
          <Label htmlFor="gallery-caption">{t('assets.galleryCaption')}</Label>
          <Input
            id="gallery-caption"
            value={caption}
            onChange={(event) => {
              setCaption(event.target.value);
            }}
          />
        </div>
        <Button type="submit" disabled={isGalleryPending || alt.trim() === ''}>
          {t(isGalleryPending ? 'assets.uploading' : 'assets.uploadGallery')}
        </Button>
        {galleryState.status === 'error' ? (
          <p className={editorClasses.errorText} role="alert">
            {t(`assets.errors.${galleryState.error}`)}
          </p>
        ) : null}
      </form>

      {props.gallery.map((item, index) => (
        <div className={editorClasses.entryActions} key={item.id}>
          <span>{item.alt}</span>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              props.onGalleryRemove(index);
            }}
          >
            {t('assets.remove')}
          </Button>
        </div>
      ))}

      <form action={attachmentAction} className={editorClasses.collection}>
        <input type="hidden" name="portfolioId" value={props.portfolioId} />
        <input type="hidden" name="purpose" value="attachment" />
        <div className={editorClasses.field}>
          <Label htmlFor="attachment-asset">{t('assets.attachmentFile')}</Label>
          <Input
            id="attachment-asset"
            name="asset"
            type="file"
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/rtf,image/png,image/jpeg,image/webp"
            required
          />
        </div>
        <div className={editorClasses.field}>
          <Label htmlFor="attachment-kind">{t('assets.attachmentKind')}</Label>
          <Select
            id="attachment-kind"
            value={kind}
            onChange={(event) => {
              setKind(event.target.value as typeof kind);
            }}
          >
            {EDITOR_ATTACHMENT_KINDS.map((value) => (
              <option value={value} key={value}>
                {t(`assets.kinds.${value}`)}
              </option>
            ))}
          </Select>
        </div>
        <div className={editorClasses.field}>
          <Label htmlFor="attachment-label">{t('assets.attachmentLabel')}</Label>
          <Input
            id="attachment-label"
            value={label}
            onChange={(event) => {
              setLabel(event.target.value);
            }}
            required
          />
        </div>
        <Button type="submit" disabled={isAttachmentPending || label.trim() === ''}>
          {t(isAttachmentPending ? 'assets.uploading' : 'assets.uploadAttachment')}
        </Button>
        {attachmentState.status === 'error' ? (
          <p className={editorClasses.errorText} role="alert">
            {t(`assets.errors.${attachmentState.error}`)}
          </p>
        ) : null}
      </form>

      {props.attachments.map((item, index) => (
        <div className={editorClasses.entryActions} key={item.id}>
          <span>{item.label}</span>
          <Label htmlFor={`attachment-visible-${item.id}`}>
            <Input
              id={`attachment-visible-${item.id}`}
              type="checkbox"
              checked={item.visible}
              onChange={(event) => {
                props.onAttachmentVisibilityChange?.(index, event.target.checked);
              }}
            />
            {t('collections.fields.visible')}
          </Label>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              props.onAttachmentRemove(index);
            }}
          >
            {t('assets.remove')}
          </Button>
        </div>
      ))}
    </section>
  );
}
