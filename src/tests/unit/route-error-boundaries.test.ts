import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import AuthRouteError from '@/app/(auth)/error';
import MarketingRouteError from '@/app/(marketing)/error';
import DashboardRouteError from '@/app/dashboard/error';
import { NestedRouteError } from '@/shared/containers/nested-route-error.container';

describe('nested route error boundaries', () => {
  it('declares the Next client boundary in every nested error file', () => {
    const authSource = readFileSync('src/app/(auth)/error.tsx', 'utf8');
    const marketingSource = readFileSync('src/app/(marketing)/error.tsx', 'utf8');
    const dashboardSource = readFileSync('src/app/dashboard/error.tsx', 'utf8');

    expect(authSource.startsWith("'use client';")).toBe(true);
    expect(marketingSource.startsWith("'use client';")).toBe(true);
    expect(dashboardSource.startsWith("'use client';")).toBe(true);
  });

  it('use content-only errors so their platform layout header and footer remain mounted', () => {
    expect(AuthRouteError).toBe(NestedRouteError);
    expect(MarketingRouteError).toBe(NestedRouteError);
    expect(DashboardRouteError).toBe(NestedRouteError);
  });
});
