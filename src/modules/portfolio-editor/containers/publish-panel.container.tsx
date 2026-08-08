'use client';
// client-boundary-reason: three server actions with their own pending states,
// plus a slug field whose value drives the URL preview as the user types.

import { useActionState, useState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { ErrorIcon, WarningIcon } from '@/packages/icons';
import { Button, Input, Label } from '@/packages/ui-primitives';

import { claimSlugAction, publishAction, unpublishAction } from '../actions/editor.actions';
import { editorClasses } from '../constants/editor-style.constants';
import { EDITOR_INITIAL_STATE } from '../constants/editor.constants';
import type { PublishPanelProps } from '../types/publish-panel.types';

/**
 * Claim an address, then publish.
 *
 * Two separate actions on purpose. Changing a URL and making a portfolio public
 * are different decisions with different consequences — the first breaks
 * existing links, the second exposes content — and a single button that did
 * both would make one of them invisible.
 *
 * Publish blockers are listed together rather than surfaced one refused attempt
 * at a time.
 */
/** Publishing, republishing and the in-flight state are three distinct labels. */
function resolvePublishLabelKey(isPublishing: boolean, isPublished: boolean): string {
  if (isPublishing) {
    return 'publish.publishing';
  }

  return isPublished ? 'publish.republish' : 'publish.publish';
}

export function PublishPanelContainer(props: Readonly<PublishPanelProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.editor);
  const [slug, setSlug] = useState<string>(props.slug);
  const [slugState, claimAction, isClaiming] = useActionState(
    claimSlugAction,
    EDITOR_INITIAL_STATE,
  );
  const [publishState, runPublish, isPublishing] = useActionState(
    publishAction,
    EDITOR_INITIAL_STATE,
  );
  const [unpublishState, runUnpublish, isUnpublishing] = useActionState(
    unpublishAction,
    EDITOR_INITIAL_STATE,
  );

  const error = slugState.error ?? publishState.error ?? unpublishState.error;
  const blockers = publishState.blockers ?? [];
  const publishLabelKey = resolvePublishLabelKey(isPublishing, props.isPublished);

  return (
    <section className={editorClasses.section}>
      <div className={editorClasses.sectionHead}>
        <h2 className={editorClasses.sectionTitle}>{t('publish.title')}</h2>
      </div>
      <p className={editorClasses.sectionHint}>{t('publish.hint')}</p>

      {error === null ? null : (
        <p className={editorClasses.error} role="alert">
          <ErrorIcon aria-hidden size={18} />
          <span className={editorClasses.errorText}>{t(error)}</span>
        </p>
      )}

      {blockers.length === 0 ? null : (
        <div className={editorClasses.blockerList}>
          <p className={editorClasses.status}>{t('publish.blockersTitle')}</p>
          {blockers.map((blocker) => (
            <p key={blocker} className={editorClasses.blocker}>
              <WarningIcon aria-hidden size={16} />
              {t(`publish.blockers.${blocker}`)}
            </p>
          ))}
        </div>
      )}

      <form action={claimAction} className={editorClasses.slugRow}>
        <input type="hidden" name="portfolioId" value={props.portfolioId} />
        <div className={editorClasses.field}>
          <Label htmlFor="publish-slug">{t('publish.slugLabel')}</Label>
          <Input
            id="publish-slug"
            name="slug"
            value={slug}
            maxLength={48}
            onChange={(event) => {
              setSlug(event.target.value);
            }}
          />
          <p className={editorClasses.slugPreview}>
            {t('publish.urlPreview', { url: `${props.origin}/${slug}` })}
          </p>
        </div>
        <Button type="submit" variant="secondary" disabled={isClaiming}>
          {t('publish.claim')}
        </Button>
      </form>

      <div className={editorClasses.headerActions}>
        <form action={runPublish}>
          <input type="hidden" name="portfolioId" value={props.portfolioId} />
          <Button type="submit" disabled={isPublishing}>
            {t(publishLabelKey)}
          </Button>
        </form>

        {props.isPublished ? (
          <form action={runUnpublish}>
            <input type="hidden" name="portfolioId" value={props.portfolioId} />
            <Button type="submit" variant="secondary" disabled={isUnpublishing}>
              {t('publish.unpublish')}
            </Button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
