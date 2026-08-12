'use client';
// client-boundary-reason: the upload form tracks its server-action lifecycle
// and hands the accepted asset id to the unsaved draft held by the editor.

import { useActionState, useEffect, useRef, type ReactElement } from 'react';

import { ASSET_UPLOAD_INITIAL_STATE } from '@/modules/assets';
import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button, Label } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import type { PortraitUploadProps } from '../types/portrait-upload.types';

import { ImageCropFieldContainer } from './image-crop-field.container';

export function PortraitUploadContainer(props: Readonly<PortraitUploadProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.editor);
  const [state, formAction, isPending] = useActionState(
    props.uploadAction,
    ASSET_UPLOAD_INITIAL_STATE,
  );
  const handledAssetId = useRef<string | null>(null);

  useEffect(() => {
    if (state.status !== 'success' || handledAssetId.current === state.asset.id) {
      return;
    }

    handledAssetId.current = state.asset.id;
    props.onUploaded(state.asset.id);
  }, [props, state]);

  return (
    <section className={editorClasses.section} aria-labelledby="portrait-upload-title">
      <div className={editorClasses.sectionHead}>
        <h2 id="portrait-upload-title" className={editorClasses.sectionTitle}>
          {t('assets.portraitTitle')}
        </h2>
      </div>
      <p className={editorClasses.sectionHint}>{t('assets.portraitHint')}</p>
      <form action={formAction} className={editorClasses.collection}>
        <input type="hidden" name="portfolioId" value={props.portfolioId} />
        <input type="hidden" name="purpose" value="portrait" />
        <div className={editorClasses.field}>
          <Label htmlFor="portrait-asset">{t('assets.portraitLabel')}</Label>
          <ImageCropFieldContainer
            id="portrait-asset"
            name="asset"
            accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
            required
            aspectRatio={1}
            shape="circle"
            outputWidth={720}
            outputHeight={720}
            dialogTitle={t('assets.crop.title')}
            zoomLabel={t('assets.crop.zoomLabel')}
            fitModeLabel={t('assets.crop.fitModeLabel')}
            cropModeLabel={t('assets.crop.cropModeLabel')}
            fullPhotoModeLabel={t('assets.crop.fullPhotoModeLabel')}
            aspectRatioLabel={t('assets.crop.aspectRatioLabel')}
            applyLabel={t('assets.crop.apply')}
            cancelLabel={t('assets.crop.cancel')}
          />
          <p className={editorClasses.fieldHint}>{t('assets.portraitFormats')}</p>
        </div>
        <div className={editorClasses.entryActions}>
          <Button type="submit" disabled={isPending}>
            {t(isPending ? 'assets.uploading' : 'assets.uploadPortrait')}
          </Button>
          {props.hasPortrait ? (
            <Button type="button" variant="secondary" onClick={props.onRemove}>
              {t('assets.removePortrait')}
            </Button>
          ) : null}
        </div>
        {state.status === 'success' ? (
          <p className={editorClasses.statusSaved} role="status">
            {t('assets.uploaded')}
          </p>
        ) : null}
        {state.status === 'error' ? (
          <p className={editorClasses.errorText} role="alert">
            {t(`assets.errors.${state.error}`)}
          </p>
        ) : null}
      </form>
    </section>
  );
}
