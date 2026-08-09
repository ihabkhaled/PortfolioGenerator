/** Public surface of the marketing module. */

export { LandingHero } from './components/landing-hero.component';
export { LandingCta } from './components/landing-cta.component';
export { LandingDirectory } from './components/landing-directory.component';
export { LandingFaq } from './components/landing-faq.component';
export { LandingPrincipleList } from './components/landing-principle-list.component';
export { LandingStepList } from './components/landing-step-list.component';
export { MarketingTopicPage } from './components/marketing-topic-page.component';
export { findMarketingPage, MARKETING_PAGES } from './constants/marketing-pages.constants';
export { topicClasses } from './constants/marketing-style.constants';
export type {
  LandingHeroProps,
  LandingCtaProps,
  LandingDirectoryItem,
  LandingDirectoryProps,
  LandingFaqItem,
  LandingFaqProps,
  LandingPrinciple,
  LandingPrincipleListProps,
  LandingStep,
  LandingStepListProps,
  MarketingPageDefinition,
  MarketingTopicPageProps,
} from './types/marketing.types';
