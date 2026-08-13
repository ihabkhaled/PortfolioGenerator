'use client';
// client-boundary-reason: the button disables itself while the redirecting sign-out action is pending.

import { useActionState } from 'react';
import type { ReactElement } from 'react';

import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { Button } from '@/packages/ui-primitives';

import { adminSignOutAction } from '../actions/admin-account.actions';

export function AdminSignOutButtonContainer(): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.admin);
  const [, formAction, isPending] = useActionState(adminSignOutAction, null);

  return (
    <form action={formAction}>
      <Button type="submit" variant="ghost" size="sm" disabled={isPending}>
        {t('topBar.signOut')}
      </Button>
    </form>
  );
}
