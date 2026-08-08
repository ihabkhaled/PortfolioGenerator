import type { PortfolioDocument } from '@/modules/portfolio-document';

import { PUBLISH_BLOCKERS } from '../constants/publish.constants';
import type { PublishBlocker } from '../types/publish.types';

/**
 * What a portfolio needs before it can be public.
 *
 * Deliberately a short list. The temptation is to require a "complete"
 * portfolio — experience, projects, a summary — but a graduate with one job and
 * three skills has a legitimate portfolio, and a platform that tells them
 * otherwise is wrong. The bar is: a reader can tell who this is and what they
 * do, and there is something on the page.
 *
 * Returned as a list rather than a boolean so the publish screen can show every
 * blocker at once instead of revealing them one refused attempt at a time.
 */
export function findPublishBlockers(document: PortfolioDocument): readonly PublishBlocker[] {
  const blockers: PublishBlocker[] = [];

  if (document.identity.displayName.trim() === '') {
    blockers.push(PUBLISH_BLOCKERS.missingName);
  }

  if (document.identity.headline === null || document.identity.headline.trim() === '') {
    blockers.push(PUBLISH_BLOCKERS.missingHeadline);
  }

  if (!hasAnyContent(document)) {
    blockers.push(PUBLISH_BLOCKERS.emptyPortfolio);
  }

  const home = document.pages.find((page) => page.slug === '');

  if (!home?.visible) {
    blockers.push(PUBLISH_BLOCKERS.noVisibleHomePage);
  }

  return blockers;
}

/**
 * Whether there is anything on the page beyond a name and a headline. The hero
 * alone renders, but publishing a portfolio that is only a hero would be
 * publishing an empty page with someone's name on it.
 */
export function hasAnyContent(document: PortfolioDocument): boolean {
  return (
    document.experience.length > 0 ||
    document.projects.length > 0 ||
    document.education.length > 0 ||
    document.certifications.length > 0 ||
    document.skills.some((group) => group.items.length > 0) ||
    (document.identity.summary !== null && document.identity.summary.trim() !== '')
  );
}

export function isPublishable(document: PortfolioDocument): boolean {
  return findPublishBlockers(document).length === 0;
}
