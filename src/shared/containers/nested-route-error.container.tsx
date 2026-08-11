'use client';
// client-boundary-reason: nested Next error boundaries receive a client reset callback.

import type { ReactElement } from 'react';

import { useAppTranslation, I18N_NAMESPACES } from '@/packages/i18n';
import { Button } from '@/packages/ui-primitives';
import { sectionClasses } from '@/shared/components/data-display/section.variants';
import type { RouteErrorBoundaryProps } from '@/shared/components/types/shared-component.types';

/** Error content for route groups whose parent SiteShell must remain mounted. */
export function NestedRouteError(props: Readonly<RouteErrorBoundaryProps>): ReactElement {
  const t = useAppTranslation(I18N_NAMESPACES.errors);

  return (
    <section className={sectionClasses.page}>
      <div className={sectionClasses.pageHeader}>
        <h1 className={sectionClasses.pageTitle}>{t('title')}</h1>
        <p className={sectionClasses.pageLead}>{t('lead')}</p>
        <div className={sectionClasses.pageActions}>
          <Button variant="secondary" onClick={props.reset}>
            {t('retry')}
          </Button>
        </div>
      </div>
    </section>
  );
}
