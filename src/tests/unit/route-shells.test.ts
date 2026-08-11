import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

describe('platform route shells', () => {
  it('keeps Preferences inside the account menu instead of duplicating it in dashboard navigation', () => {
    const source = readFileSync('src/app/dashboard/layout.tsx', 'utf8');

    expect(source).toContain('preferencesHref={ROUTE_PATHS.dashboardSettings}');
    expect(source).not.toContain(
      'navigation={\n          <AppLink href={ROUTE_PATHS.dashboardSettings}',
    );
  });

  it('renders the root not-found content inside the complete marketing shell', () => {
    const source = readFileSync('src/app/not-found.tsx', 'utf8');

    expect(source).toContain("import MarketingLayout from './(marketing)/layout';");
    expect(source).toContain('<MarketingLayout>');
  });
});
