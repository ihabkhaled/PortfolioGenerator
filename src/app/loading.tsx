import type { ReactElement } from 'react';

import { PageSkeleton } from '@/shared/components/feedback/page-skeleton.component';

export default function RootLoading(): ReactElement {
  return <PageSkeleton />;
}
