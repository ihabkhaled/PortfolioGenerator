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
      titleKey: 'landing.useCases.title',
      bodyKey: `pages.${slug}.sections.first`,
    },
    {
      kind: 'trust-boundary',
      titleKey: 'landing.trust.title',
      bodyKey: `pages.${slug}.sections.second`,
    },
    { kind: 'comparison', titleKey: 'principlesTitle', bodyKey: `pages.${slug}.sections.third` },
    { kind: 'faq', titleKey: 'landing.faq.title', bodyKey: `pages.${slug}.sections.first` },
    {
      kind: 'resource',
      titleKey: 'landing.directory.title',
      bodyKey: `pages.${slug}.sections.second`,
    },
    {
      kind: 'internal-links',
      titleKey: 'landing.cta.title',
      bodyKey: `pages.${slug}.sections.third`,
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
