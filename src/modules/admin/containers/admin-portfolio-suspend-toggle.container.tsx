'use client';
// client-boundary-reason: the suspend/activate button tracks its own pending
// state and surfaces the action's success/error outcome inline.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button } from '@/packages/ui-primitives';

import { setAdminPortfolioSuspensionAction } from '../actions/admin-portfolio.actions';
import { adminPortfolioClasses } from '../constants/admin-portfolio-style.constants';
import {
  ADMIN_PORTFOLIO_ACTION_STATE_INITIAL,
  ADMIN_PORTFOLIO_FIELD_NAMES,
} from '../constants/admin-portfolio.constants';
import type { AdminPortfolioSuspendToggleProps } from '../types/admin-portfolio-view.types';

export function AdminPortfolioSuspendToggleContainer(
  props: Readonly<AdminPortfolioSuspendToggleProps>,
): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [state, formAction, isPending] = useActionState(
    setAdminPortfolioSuspensionAction,
    ADMIN_PORTFOLIO_ACTION_STATE_INITIAL,
  );

  const idleLabelKey = props.isSuspended
    ? 'portfolios.actions.activate'
    : 'portfolios.actions.suspend';
  const label = t(isPending ? 'portfolios.actions.pending' : idleLabelKey);

  return (
    <form action={formAction} className={adminPortfolioClasses.actionForm}>
      <input
        type="hidden"
        name={ADMIN_PORTFOLIO_FIELD_NAMES.portfolioId}
        value={props.portfolioId}
      />
      <input
        type="hidden"
        name={ADMIN_PORTFOLIO_FIELD_NAMES.suspend}
        value={props.isSuspended ? 'false' : 'true'}
      />
      <Button
        type="submit"
        variant={props.isSuspended ? 'secondary' : 'danger'}
        size="sm"
        disabled={isPending}
      >
        {label}
      </Button>
      {state.status === 'error' && state.error !== null ? (
        <p className={adminPortfolioClasses.actionError} role="alert">
          {t(state.error)}
        </p>
      ) : null}
    </form>
  );
}
