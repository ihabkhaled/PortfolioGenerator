import { describe, expect, it } from 'vitest';

import { MARKETING_PAGES } from '@/modules/marketing';
import { MARKETING_ROUTE_PATHS } from '@/shared/constants/route-paths.constants';

describe('marketing route inventory', () => {
  it('covers the sixteen approved topics in addition to the existing home page', () => {
    expect(MARKETING_PAGES).toHaveLength(16);
    expect(MARKETING_PAGES.map((page) => page.slug)).toEqual(Object.keys(MARKETING_ROUTE_PATHS));
  });

  it('gives every topic substantial sections, distinct metadata, and internal links', () => {
    expect(new Set(MARKETING_PAGES.map((page) => page.titleKey)).size).toBe(16);
    for (const page of MARKETING_PAGES) {
      expect(page.sections).toHaveLength(3);
      expect(page.relatedSlugs.length).toBeGreaterThanOrEqual(2);
      expect(page.titleKey).not.toBe(page.descriptionKey);
    }
  });
});
