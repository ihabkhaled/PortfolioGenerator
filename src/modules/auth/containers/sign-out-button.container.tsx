'use client';
// client-boundary-reason: the pending state of the sign-out submission is
// client-side, and the button must stay disabled while it runs.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { useAppTranslation, I18N_NAMESPACES } from '@/packages/i18n';
import { Button } from '@/packages/ui-primitives';

import { signOutAction } from '../actions/auth.actions';

export function SignOutButtonContainer(): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.auth);
  const [, formAction, isPending] = useActionState(signOutAction, null);

  return (
    <form action={formAction}>
      <Button type="submit" variant="ghost" size="sm" disabled={isPending}>
        {t('signOut')}
      </Button>
    </form>
  );
}
