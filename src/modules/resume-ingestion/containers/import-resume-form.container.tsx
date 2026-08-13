'use client';
// client-boundary-reason: useActionState surfaces the upload's pending state
// and rejection reason, and the file input needs a change handler to show the
// chosen filename before submission.

import { useActionState, useState } from 'react';
import type { ChangeEvent, ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { ErrorIcon, UploadIcon } from '@/packages/icons';
import { Button } from '@/packages/ui-primitives';

import { importResumeAction } from '../actions/import-resume.actions';
import { ACCEPTED_UPLOAD_MIME, IMPORT_INITIAL_STATE } from '../constants/import-form.constants';
import { importClasses } from '../constants/import-style.constants';
import type { ImportResumeFormProps } from '../types/import-form-props.types';

export function ImportResumeFormContainer(props: Readonly<ImportResumeFormProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.ingestion);
  const [state, formAction, isPending] = useActionState(importResumeAction, IMPORT_INITIAL_STATE);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    setFileName(event.target.files?.[0]?.name ?? null);
  }

  return (
    <form action={formAction} className={importClasses.panel}>
      <input type="hidden" name="portfolioId" value={props.portfolioId} />

      {state.error === null ? null : (
        <p className={importClasses.error} role="alert">
          <ErrorIcon aria-hidden size={18} />
          <span className={importClasses.errorText}>{t(state.error)}</span>
        </p>
      )}

      <div className={importClasses.dropzone}>
        <UploadIcon aria-hidden size={24} />
        <p className={importClasses.dropzoneTitle}>{t('upload.title')}</p>
        <p className={importClasses.dropzoneHint}>
          {t('upload.hint', { maxMegabytes: props.maxMegabytes, maxPages: props.maxPages })}
        </p>
        <label className={importClasses.fileInput}>
          <span className={importClasses.fieldLabel}>{t('upload.fieldLabel')}</span>
          <input
            type="file"
            name="resume"
            accept={ACCEPTED_UPLOAD_MIME}
            required
            onChange={handleFileChange}
          />
        </label>
        {fileName === null ? null : <p className={importClasses.fileName}>{fileName}</p>}
      </div>

      <div className={importClasses.actions}>
        <Button
          type="submit"
          disabled={isPending}
          onClick={() => {
            setFileName(null);
          }}
        >
          {t(isPending ? 'upload.pending' : 'upload.submit')}
        </Button>
      </div>
    </form>
  );
}
