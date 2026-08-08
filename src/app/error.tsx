'use client';
// client-boundary-reason: an error boundary needs the reset callback and the
// error object, both of which only exist on the client.

import type { ReactElement } from 'react';

import { useAppTranslation, I18N_NAMESPACES } from '@/packages/i18n';
import { Button } from '@/packages/ui-primitives';
import { sectionClasses } from '@/shared/components/data-display/section.variants';

export default function RouteError(props: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.errors);

  return (
    <main className={sectionClasses.page}>
      <div className={sectionClasses.pageHeader}>
        <h1 className={sectionClasses.pageTitle}>{t('title')}</h1>
        {/* The raw message is deliberately not rendered: it can contain
            internal detail, and a digest is what support actually needs. */}
        <p className={sectionClasses.pageLead}>{t('lead')}</p>
        <div className={sectionClasses.pageActions}>
          <Button variant="secondary" onClick={props.reset}>
            {t('retry')}
          </Button>
        </div>
      </div>
    </main>
  );
}
