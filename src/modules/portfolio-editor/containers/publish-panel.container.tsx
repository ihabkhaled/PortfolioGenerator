'use client';
// client-boundary-reason: three server actions with their own pending states,
// plus a slug field whose value drives the URL preview as the user types.

import { useActionState, useState } from 'react';
import type { ReactElement } from 'react';

import { copyBrowserText } from '@/packages/browser';
import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { CopyIcon, ErrorIcon, ExternalIcon, WarningIcon } from '@/packages/icons';
import { Button, Input, Label } from '@/packages/ui-primitives';
import { ExternalLink } from '@/shared/components/primitives/external-link';
import { buildPortfolioPath } from '@/shared/constants/route-paths.constants';

import { claimSlugAction, publishAction, unpublishAction } from '../actions/editor.actions';
import { editorClasses } from '../constants/editor-style.constants';
import { EDITOR_INITIAL_STATE } from '../constants/editor.constants';
import { useDraftStatus } from '../contexts/draft-status.context';
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
  const tLocalization = useAppTranslation(I18N_NAMESPACES.localization);
  const [slug, setSlug] = useState<string>(props.slug);
  const [copied, setCopied] = useState(false);
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

  const draft = useDraftStatus();
  const error = slugState.error ?? publishState.error ?? unpublishState.error;
  const blockers = publishState.blockers ?? [];
  const publishLabelKey = resolvePublishLabelKey(isPublishing, props.isPublished);
  const publicUrl = `${props.origin}${buildPortfolioPath(slug)}`;

  return (
    <section className={editorClasses.section}>
      <div className={editorClasses.sectionHead}>
        <h2 className={editorClasses.sectionTitle}>{t('publish.title')}</h2>
      </div>
      <p className={editorClasses.sectionHint}>{t('publish.hint')}</p>

      {draft.isDirty ? (
        <p className={editorClasses.blocker}>
          <WarningIcon aria-hidden size={16} />
          {t('publish.unsavedChanges')}
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={draft.save}
            disabled={draft.isSaving}
          >
            {t(draft.isSaving ? 'saving' : 'save')}
          </Button>
        </p>
      ) : null}

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
        </div>
        <Button type="submit" variant="secondary" disabled={isClaiming}>
          {t('publish.claim')}
        </Button>
        <div className={editorClasses.slugPreview}>
          <span>{t('publish.urlPreview', { url: publicUrl })}</span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              void copyBrowserText(publicUrl).then(() => {
                setCopied(true);
              });
            }}
          >
            <CopyIcon aria-hidden size={14} />
            {tLocalization(copied ? 'copied' : 'copyUrl')}
          </Button>
          <ExternalLink href={publicUrl} aria-label={t('publish.urlPreview', { url: publicUrl })}>
            <ExternalIcon aria-hidden size={14} />
          </ExternalLink>
        </div>
      </form>

      <div className={editorClasses.headerActions}>
        <form action={runPublish}>
          <input type="hidden" name="portfolioId" value={props.portfolioId} />
          <Button type="submit" disabled={isPublishing || draft.isDirty}>
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
