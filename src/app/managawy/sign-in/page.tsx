import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { AdminSignInFormContainer } from '@/modules/admin/admin-ui';
import { getOptionalAdminSession } from '@/modules/admin/server';
import { toAppRoute } from '@/packages/link';
import { appRedirect } from '@/packages/navigation';
import { ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminSignInPage(): Promise<ReactElement> {
  const admin = await getOptionalAdminSession();

  if (admin) {
    appRedirect(toAppRoute(ROUTE_PATHS.managawy));
  }

  return <AdminSignInFormContainer />;
}
