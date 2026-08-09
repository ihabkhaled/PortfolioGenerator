import type { ReactElement } from 'react';

import { pageSkeletonClasses } from './page-skeleton.variants';

/** A quiet, layout-stable placeholder for route transitions and initial reads. */
export function PageSkeleton(): ReactElement {
  return (
    <div className={pageSkeletonClasses.shell} aria-hidden>
      <div className={pageSkeletonClasses.header}>
        <span className={pageSkeletonClasses.eyebrow} />
        <span className={pageSkeletonClasses.title} />
        <span className={pageSkeletonClasses.lead} />
      </div>
      <div className={pageSkeletonClasses.grid}>
        <div className={pageSkeletonClasses.panel}>
          <span className={pageSkeletonClasses.shortLine} />
          <span className={pageSkeletonClasses.line} />
          <span className={pageSkeletonClasses.line} />
        </div>
        <div className={pageSkeletonClasses.panel}>
          <span className={pageSkeletonClasses.shortLine} />
          <span className={pageSkeletonClasses.line} />
          <span className={pageSkeletonClasses.line} />
        </div>
      </div>
    </div>
  );
}
