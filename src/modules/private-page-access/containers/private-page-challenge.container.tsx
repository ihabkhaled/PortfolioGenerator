'use client';
// client-boundary-reason: the grant cookie must finish committing before the
// browser navigates to the protected page.

import { useState, type ReactElement, type SyntheticEvent } from 'react';

import { navigateBrowser } from '@/packages/browser';

import { PrivatePageChallenge } from '../components/private-page-challenge.component';
import { PRIVATE_PAGE_ACCESS_ENDPOINT } from '../constants/private-page-challenge.constants';
import type { PrivatePageChallengeProps } from '../types/private-page-challenge.types';

export function PrivatePageChallengeContainer(
  props: Readonly<PrivatePageChallengeProps>,
): ReactElement {
  const [denied, setDenied] = useState(props.denied);
  const [pending, setPending] = useState(false);

  async function unlock(event: SyntheticEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);

    try {
      const response = await fetch(PRIVATE_PAGE_ACCESS_ENDPOINT, {
        method: 'POST',
        headers: { accept: 'application/json' },
        body: new FormData(event.currentTarget),
        redirect: 'error',
      });

      if (!response.ok) {
        setDenied(true);
        return;
      }

      const result: unknown = await response.json();
      if (
        typeof result !== 'object' ||
        result === null ||
        !('target' in result) ||
        typeof result.target !== 'string' ||
        !result.target.startsWith('/') ||
        result.target.startsWith('//')
      ) {
        setDenied(true);
        return;
      }

      navigateBrowser(result.target);
    } catch {
      setDenied(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <PrivatePageChallenge
      {...props}
      denied={denied}
      pending={pending}
      onSubmit={(event) => {
        void unlock(event);
      }}
    />
  );
}
