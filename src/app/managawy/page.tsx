import type { ReactElement } from 'react';

import {
  adminShellClasses,
  buildAdminDashboardStats,
  getAdminDashboardStats,
  requireAdmin,
} from '@/modules/admin/server';

export default async function AdminDashboardPage(): Promise<ReactElement> {
  await requireAdmin('USERS_VIEW');

  const counts = await getAdminDashboardStats();
  const stats = buildAdminDashboardStats(counts);

  return (
    <div className={adminShellClasses.statsGrid}>
      {stats.map((stat) => (
        <div key={stat.id} className={adminShellClasses.statTile}>
          <span className={adminShellClasses.statLabel}>{stat.label}</span>
          <span className={adminShellClasses.statValue}>{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
