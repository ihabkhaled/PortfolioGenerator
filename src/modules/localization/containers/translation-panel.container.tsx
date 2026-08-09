'use client';
// client-boundary-reason: three server-action states expose generation, review and publish progress independently.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button, Label, Select, Textarea } from '@/packages/ui-primitives';

import {
  correctTranslationAction,
  generateTranslationAction,
  publishTranslationAction,
  reviewTranslationAction,
} from '../actions/translation.actions';
import { localizationClasses } from '../constants/localization-style.constants';
import {
  TRANSLATION_ACTION_FIELDS,
  TRANSLATION_ACTION_INITIAL_STATE,
} from '../constants/translation-action.constants';
import type { TranslationPanelProps } from '../types/localization-view.types';
import type { TranslationSnapshot } from '../types/translation.types';

function getPendingLabel(pending: boolean, pendingLabel: string, idleLabel: string): string {
  if (pending) return pendingLabel;
  return idleLabel;
}

function getSnapshotStatusKey(
  snapshot: TranslationSnapshot,
): 'translation.draft' | 'translation.reviewed' | 'translation.published' {
  if (snapshot.reviewedDocument === null) return 'translation.draft';
  if (
    snapshot.publishedAt === null ||
    (snapshot.reviewedAt !== null && snapshot.reviewedAt > snapshot.publishedAt)
  ) {
    return 'translation.reviewed';
  }
  return 'translation.published';
}

export function TranslationPanelContainer(props: Readonly<TranslationPanelProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.localization);
  const [generateState, generateAction, generating] = useActionState(
    generateTranslationAction,
    TRANSLATION_ACTION_INITIAL_STATE,
  );
  const [reviewState, reviewAction, reviewing] = useActionState(
    reviewTranslationAction,
    TRANSLATION_ACTION_INITIAL_STATE,
  );
  const [publishState, publishAction, publishing] = useActionState(
    publishTranslationAction,
    TRANSLATION_ACTION_INITIAL_STATE,
  );
  const [correctState, correctAction, correcting] = useActionState(
    correctTranslationAction,
    TRANSLATION_ACTION_INITIAL_STATE,
  );
  const error = [generateState, correctState, reviewState, publishState].find(
    (state) => state.status === 'error',
  );
  const generateLabel = getPendingLabel(
    generating,
    t('translation.generating'),
    t('translation.generate'),
  );
  const reviewLabel = getPendingLabel(
    reviewing,
    t('translation.reviewing'),
    t('translation.markReviewed'),
  );
  const publishLabel = getPendingLabel(
    publishing,
    t('translation.publishing'),
    t('translation.publish'),
  );

  return (
    <section className={localizationClasses.panel}>
      <header className={localizationClasses.header}>
        <h2 className={localizationClasses.title}>{t('translation.title')}</h2>
        <p className={localizationClasses.hint}>{t('translation.hint')}</p>
      </header>
      <form action={generateAction} className={localizationClasses.form}>
        <input
          type="hidden"
          name={TRANSLATION_ACTION_FIELDS.portfolioId}
          value={props.portfolioId}
        />
        <div className={localizationClasses.field}>
          <Label htmlFor="translation-locale">{t('translation.locale')}</Label>
          <Select id="translation-locale" name={TRANSLATION_ACTION_FIELDS.locale}>
            {props.localeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" disabled={generating}>
          {generateLabel}
        </Button>
      </form>
      {error === undefined ? null : (
        <p className={localizationClasses.error} role="alert">
          {t(error.error ?? 'translation.errors.generic')}
        </p>
      )}
      <div className={localizationClasses.list}>
        {props.snapshots.map((snapshot) => (
          <article key={snapshot.locale} className={localizationClasses.item}>
            <div className={localizationClasses.itemHeader}>
              <h3 className={localizationClasses.itemTitle}>{t(`locales.${snapshot.locale}`)}</h3>
              <span className={localizationClasses.status}>
                {t(snapshot.isStale ? 'translation.stale' : getSnapshotStatusKey(snapshot))}
              </span>
            </div>
            <div className={localizationClasses.preview}>
              <strong>{snapshot.draftDocument.identity.displayName}</strong>
              {snapshot.draftDocument.identity.headline === null ? null : (
                <span>{snapshot.draftDocument.identity.headline}</span>
              )}
              {snapshot.draftDocument.identity.summary === null ? null : (
                <span>{snapshot.draftDocument.identity.summary}</span>
              )}
              <span>{snapshot.draftDocument.pages.map((page) => page.title).join(' · ')}</span>
              <span>
                {t('translation.versions', {
                  draft: snapshot.draftVersion,
                  published: snapshot.publishedVersion,
                })}
              </span>
            </div>
            <details>
              <summary>{t('translation.reviewDocument')}</summary>
              <pre className={localizationClasses.document}>
                {JSON.stringify(snapshot.draftDocument, null, 2)}
              </pre>
            </details>
            <form action={correctAction} className={localizationClasses.field}>
              <input
                type="hidden"
                name={TRANSLATION_ACTION_FIELDS.portfolioId}
                value={props.portfolioId}
              />
              <input
                type="hidden"
                name={TRANSLATION_ACTION_FIELDS.locale}
                value={snapshot.locale}
              />
              <input
                type="hidden"
                name={TRANSLATION_ACTION_FIELDS.expectedVersion}
                value={snapshot.draftVersion}
              />
              <Label htmlFor={`translation-document-${snapshot.locale}`}>
                {t('translation.correctDocument')}
              </Label>
              <Textarea
                id={`translation-document-${snapshot.locale}`}
                name={TRANSLATION_ACTION_FIELDS.document}
                defaultValue={JSON.stringify(snapshot.draftDocument, null, 2)}
                rows={12}
                disabled={snapshot.isStale || correcting}
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                disabled={snapshot.isStale || correcting}
              >
                {t(correcting ? 'translation.correcting' : 'translation.saveCorrection')}
              </Button>
            </form>
            <div className={localizationClasses.actions}>
              <form action={reviewAction}>
                <input
                  type="hidden"
                  name={TRANSLATION_ACTION_FIELDS.portfolioId}
                  value={props.portfolioId}
                />
                <input
                  type="hidden"
                  name={TRANSLATION_ACTION_FIELDS.locale}
                  value={snapshot.locale}
                />
                <input
                  type="hidden"
                  name={TRANSLATION_ACTION_FIELDS.expectedVersion}
                  value={snapshot.draftVersion}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  disabled={reviewing || snapshot.isStale}
                >
                  {reviewLabel}
                </Button>
              </form>
              <form action={publishAction}>
                <input
                  type="hidden"
                  name={TRANSLATION_ACTION_FIELDS.portfolioId}
                  value={props.portfolioId}
                />
                <input
                  type="hidden"
                  name={TRANSLATION_ACTION_FIELDS.locale}
                  value={snapshot.locale}
                />
                <input
                  type="hidden"
                  name={TRANSLATION_ACTION_FIELDS.expectedVersion}
                  value={snapshot.draftVersion}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={publishing || snapshot.isStale || snapshot.reviewedDocument === null}
                >
                  {publishLabel}
                </Button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
