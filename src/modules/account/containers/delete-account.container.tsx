'use client';
// client-boundary-reason: a destructive form with its own pending state, and a
// confirmation field whose value has to gate the submit button as it is typed.

import { useActionState, useState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { ErrorIcon } from '@/packages/icons';
import { Button, Input, Label } from '@/packages/ui-primitives';

import { deleteAccountAction } from '../actions/account.actions';
import { accountClasses } from '../constants/account-style.constants';
import {
  ACCOUNT_DELETE_CONFIRMATION,
  ACCOUNT_INITIAL_STATE,
} from '../constants/deletion.constants';

/**
 * Deleting the account.
 *
 * The typed confirmation is the interruption. A second "are you sure" button is
 * muscle memory by the time anyone reaches it; typing a word is the cheapest
 * thing that actually requires reading the sentence above it. The server checks
 * the same value — this is the courtesy, that is the guarantee.
 */
export function DeleteAccountContainer(): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.account);
  const [confirmation, setConfirmation] = useState<string>('');
  const [state, formAction, isPending] = useActionState(deleteAccountAction, ACCOUNT_INITIAL_STATE);

  return (
    <section className={accountClasses.dangerSection}>
      <h2 className={accountClasses.sectionTitle}>{t('delete.title')}</h2>
      <p className={accountClasses.sectionHint}>{t('delete.hint')}</p>

      {state.error === null ? null : (
        <p className={accountClasses.error} role="alert">
          <ErrorIcon aria-hidden size={18} />
          <span className={accountClasses.errorText}>{t(state.error)}</span>
        </p>
      )}

      <form action={formAction} className={accountClasses.row}>
        <div className={accountClasses.field}>
          <Label htmlFor="account-delete-confirmation">
            {t('delete.confirmationLabel', { word: ACCOUNT_DELETE_CONFIRMATION })}
          </Label>
          <Input
            id="account-delete-confirmation"
            name="confirmation"
            autoComplete="off"
            value={confirmation}
            maxLength={32}
            onChange={(event) => {
              setConfirmation(event.target.value);
            }}
          />
        </div>
        <Button
          type="submit"
          variant="danger"
          disabled={isPending || confirmation !== ACCOUNT_DELETE_CONFIRMATION}
        >
          {t(isPending ? 'delete.submitting' : 'delete.submit')}
        </Button>
      </form>
    </section>
  );
}
