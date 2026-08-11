'use client';
// client-boundary-reason: useActionState surfaces the create action's pending
// flag and validation error without a full page reload.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { useAppTranslation, I18N_NAMESPACES } from '@/packages/i18n';
import { ErrorIcon } from '@/packages/icons';
import { Button, Input, Label } from '@/packages/ui-primitives';

import { createPortfolioAction } from '../actions/portfolio.actions';
import { dashboardClasses } from '../constants/dashboard-style.constants';
import { PORTFOLIO_INITIAL_FORM_STATE } from '../constants/portfolio.constants';

export function CreatePortfolioFormContainer(): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.dashboard);
  const [state, formAction, isPending] = useActionState(
    createPortfolioAction,
    PORTFOLIO_INITIAL_FORM_STATE,
  );

  return (
    <div className={dashboardClasses.createPanel}>
      <div>
        <h2 className={dashboardClasses.createTitle}>{t('create.title')}</h2>
        <p className={dashboardClasses.createLead}>{t('create.lead')}</p>
      </div>

      {state.error === null ? null : (
        <p className={dashboardClasses.error} role="alert">
          <ErrorIcon aria-hidden size={18} />
          <span className={dashboardClasses.errorText}>{t(state.error)}</span>
        </p>
      )}

      <form action={formAction} className={dashboardClasses.form}>
        <div className={dashboardClasses.field}>
          <Label htmlFor="displayName">{t('create.nameLabel')}</Label>
          <Input id="displayName" name="displayName" type="text" required maxLength={120} />
          <span aria-hidden className={dashboardClasses.fieldHintPlaceholder} />
        </div>

        <div className={dashboardClasses.field}>
          <Label htmlFor="slug">{t('create.slugLabel')}</Label>
          <Input id="slug" name="slug" type="text" maxLength={48} aria-describedby="slug-hint" />
          <p id="slug-hint" className={dashboardClasses.fieldHint}>
            {t('create.slugHint')}
          </p>
        </div>

        <Button type="submit" disabled={isPending} className={dashboardClasses.createSubmit}>
          {t(isPending ? 'create.pending' : 'create.submit')}
        </Button>
      </form>
    </div>
  );
}
