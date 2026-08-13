'use client';
// client-boundary-reason: a destructive delete with its own pending state, and
// an inline confirm step whose visibility is local UI state.

import { useActionState, useState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button } from '@/packages/ui-primitives';

import { deleteAdminPortfolioAction } from '../actions/admin-portfolio.actions';
import { adminPortfolioClasses } from '../constants/admin-portfolio-style.constants';
import {
  ADMIN_PORTFOLIO_ACTION_STATE_INITIAL,
  ADMIN_PORTFOLIO_FIELD_NAMES,
} from '../constants/admin-portfolio.constants';
import type { AdminPortfolioDeleteProps } from '../types/admin-portfolio-view.types';

/**
 * Two steps, in-row: the first click reveals the consequence and a confirm
 * button, the second sends the request — mirroring
 * `DeletePortfolioContainer` in the account module. The confirm step resets
 * on cancel, so a stray click never leaves a live delete button in the row.
 */
export function AdminPortfolioDeleteContainer(
  props: Readonly<AdminPortfolioDeleteProps>,
): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [isConfirming, setIsConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(
    deleteAdminPortfolioAction,
    ADMIN_PORTFOLIO_ACTION_STATE_INITIAL,
  );

  if (!isConfirming) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => {
          setIsConfirming(true);
        }}
      >
        {t('portfolios.actions.delete')}
      </Button>
    );
  }

  return (
    <form action={formAction} className={adminPortfolioClasses.actionForm}>
      <input
        type="hidden"
        name={ADMIN_PORTFOLIO_FIELD_NAMES.portfolioId}
        value={props.portfolioId}
      />
      <span className={adminPortfolioClasses.confirmHint}>
        {t('portfolios.actions.deleteConfirmHint')}
      </span>
      <Button type="submit" variant="danger" size="sm" disabled={isPending}>
        {t(isPending ? 'portfolios.actions.deleting' : 'portfolios.actions.deleteConfirm')}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          setIsConfirming(false);
        }}
      >
        {t('portfolios.actions.deleteCancel')}
      </Button>
      {state.status === 'error' && state.error !== null ? (
        <p className={adminPortfolioClasses.actionError} role="alert">
          {t(state.error)}
        </p>
      ) : null}
    </form>
  );
}
