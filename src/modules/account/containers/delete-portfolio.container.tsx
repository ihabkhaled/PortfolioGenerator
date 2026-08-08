'use client';
// client-boundary-reason: a destructive submit with its own pending state, and
// an inline confirm step whose visibility is local UI state.

import { useActionState, useState } from 'react';
import type { ReactElement } from 'react';

import { Button } from '@/packages/ui-primitives';

import { deletePortfolioAction } from '../actions/account.actions';
import { accountClasses } from '../constants/account-style.constants';
import { ACCOUNT_INITIAL_STATE } from '../constants/deletion.constants';
import type { DeletePortfolioProps } from '../types/account-view.types';

/**
 * Delete one portfolio.
 *
 * Two steps, in-page: the first click reveals the consequence and a confirm
 * button, the second sends the request. A `window.confirm` would be shorter and
 * is the wrong shape — it cannot be translated, cannot be styled to match the
 * warning it carries, and this repository routes browser APIs through package
 * wrappers for exactly that kind of reason.
 *
 * The confirm step resets on cancel, so a stray click never leaves a live
 * delete button sitting in the row.
 */
export function DeletePortfolioContainer(props: Readonly<DeletePortfolioProps>): ReactElement {
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [, formAction, isPending] = useActionState(deletePortfolioAction, ACCOUNT_INITIAL_STATE);

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
        {props.label}
      </Button>
    );
  }

  return (
    <form action={formAction} className={accountClasses.row}>
      <input type="hidden" name="portfolioId" value={props.portfolioId} />
      <span className={accountClasses.sectionHint}>{props.confirmMessage}</span>
      <Button type="submit" variant="danger" size="sm" disabled={isPending}>
        {isPending ? props.submittingLabel : props.confirmLabel}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => {
          setIsConfirming(false);
        }}
      >
        {props.cancelLabel}
      </Button>
    </form>
  );
}
