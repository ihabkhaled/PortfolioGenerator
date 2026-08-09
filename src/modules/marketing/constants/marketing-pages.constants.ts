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
    `pages.${slug}.sections.first`,
    `pages.${slug}.sections.second`,
    `pages.${slug}.sections.third`,
  ],
  relatedSlugs: [
    slugs[(index + 1) % slugs.length] ?? 'features',
    slugs[(index + 2) % slugs.length] ?? 'how-it-works',
  ],
}));

export function findMarketingPage(slug: string): MarketingPageDefinition | null {
  return MARKETING_PAGES.find((page) => page.slug === slug) ?? null;
}
