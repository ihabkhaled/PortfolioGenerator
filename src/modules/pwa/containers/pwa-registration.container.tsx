'use client';
// client-boundary-reason: React state surfaces an installed service-worker update and handles the user's activation choice.

import { useEffect, useState, type ReactElement } from 'react';

import {
  observeBrowserInstallPrompt,
  observeBrowserServiceWorker,
  type BrowserInstallPrompt,
  type BrowserServiceWorkerUpdate,
} from '@/packages/browser';
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
  const [installPrompt, setInstallPrompt] = useState<BrowserInstallPrompt | null>(null);

  useEffect(() => {
    const showUpdate = (update: BrowserServiceWorkerUpdate): void => {
      setServiceWorkerUpdate(update);
    };

    return observeBrowserServiceWorker(PWA_SERVICE_WORKER_PATH, showUpdate);
  }, []);

  useEffect(() => observeBrowserInstallPrompt(setInstallPrompt), []);

  if (!serviceWorkerUpdate && !installPrompt) return null;

  const title = serviceWorkerUpdate ? props.updateTitle : props.installTitle;
  const description = serviceWorkerUpdate ? props.updateDescription : props.installDescription;
  const actionLabel = serviceWorkerUpdate ? props.updateAction : props.installAction;
  const runAction = async (): Promise<void> => {
    if (serviceWorkerUpdate) {
      await serviceWorkerUpdate.activate();
      return;
    }

    try {
      await installPrompt?.prompt();
    } catch {
      // Browsers may withdraw their install UI between the event and the click.
    } finally {
      setInstallPrompt(null);
    }
  };

  return (
    <aside className={pwaClasses.updateRegion} aria-live="polite" data-fixed-surface="pwa">
      <ErrorState
        title={title}
        description={description}
        action={
          serviceWorkerUpdate || installPrompt ? (
            <Button
              onClick={() => {
                void runAction();
              }}
            >
              {actionLabel}
            </Button>
          ) : undefined
        }
      />
    </aside>
  );
}
