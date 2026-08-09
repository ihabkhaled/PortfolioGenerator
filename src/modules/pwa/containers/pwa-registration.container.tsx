'use client';
// client-boundary-reason: React state surfaces an installed service-worker update and handles the user's activation choice.

import { useEffect, useState, type ReactElement } from 'react';

import { observeBrowserServiceWorker, type BrowserServiceWorkerUpdate } from '@/packages/browser';
import { Button } from '@/packages/ui-primitives';
import { ErrorState } from '@/shared/components/feedback/error-state.component';

import { pwaClasses } from '../constants/pwa-style.constants';
import { PWA_SERVICE_WORKER_PATH } from '../constants/pwa.constants';
import type { PwaRegistrationProps } from '../types/pwa.types';

export function PwaRegistrationContainer(
  props: Readonly<PwaRegistrationProps>,
): ReactElement | null {
  const [serviceWorkerUpdate, setServiceWorkerUpdate] = useState<BrowserServiceWorkerUpdate | null>(
    null,
  );

  useEffect(() => {
    const showUpdate = (update: BrowserServiceWorkerUpdate): void => {
      setServiceWorkerUpdate(update);
    };

    return observeBrowserServiceWorker(PWA_SERVICE_WORKER_PATH, showUpdate);
  }, []);

  if (!serviceWorkerUpdate) return null;

  return (
    <aside className={pwaClasses.updateRegion} aria-live="polite">
      <ErrorState
        title={props.updateTitle}
        description={props.updateDescription}
        action={<Button onClick={serviceWorkerUpdate.activate}>{props.updateAction}</Button>}
      />
    </aside>
  );
}
