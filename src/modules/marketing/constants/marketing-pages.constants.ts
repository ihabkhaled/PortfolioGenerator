import type { MarketingPageDefinition } from '../types/marketing.types';

const slugs = [
  'features',
  'how-it-works',
  'examples',
  'templates',
  'cv-import',
  'ai-accuracy',
  'security',
  'privacy',
  'about',
  'mission',
  'contact',
  'help',
  'faq',
  'accessibility',
  'terms',
  'changelog',
] as const;

export const MARKETING_PAGES: readonly MarketingPageDefinition[] = slugs.map((slug, index) => ({
  slug,
  titleKey: `pages.${slug}.title`,
  descriptionKey: `pages.${slug}.description`,
  sections: [
    {
      kind: 'use-case',
      titleKey: `pages.${slug}.sections.firstTitle`,
      bodyKey: `pages.${slug}.sections.first`,
    },
    {
      kind: 'trust-boundary',
      titleKey: `pages.${slug}.sections.secondTitle`,
      bodyKey: `pages.${slug}.sections.second`,
    },
    {
      kind: 'comparison',
      titleKey: `pages.${slug}.sections.thirdTitle`,
      bodyKey: `pages.${slug}.sections.third`,
    },
    {
      kind: 'faq',
      titleKey: `pages.${slug}.sections.fourthTitle`,
      bodyKey: `pages.${slug}.sections.fourth`,
    },
    {
      kind: 'resource',
      titleKey: `pages.${slug}.sections.fifthTitle`,
      bodyKey: `pages.${slug}.sections.fifth`,
    },
    {
      kind: 'internal-links',
      titleKey: `pages.${slug}.sections.sixthTitle`,
      bodyKey: `pages.${slug}.sections.sixth`,
    },
  ],
  relatedSlugs: [
    slugs[(index + 1) % slugs.length] ?? 'features',
    slugs[(index + 2) % slugs.length] ?? 'how-it-works',
  ],
}));

export function findMarketingPage(slug: string): MarketingPageDefinition | null {
  return MARKETING_PAGES.find((page) => page.slug === slug) ?? null;
}
