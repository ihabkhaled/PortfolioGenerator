import { describe, expect, it } from 'vitest';

import type { PortfolioDocument } from '@/modules/portfolio-document';
import { findPublishBlockers, hasAnyContent, isPublishable } from '@/modules/publishing';

import {
  buildFullPortfolioDocument,
  buildMinimalPortfolioDocument,
} from '../fixtures/portfolio-document.fixtures';

function stripContent(document: PortfolioDocument): PortfolioDocument {
  return {
    ...document,
    identity: { ...document.identity, summary: null },
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    skills: [],
  };
}

describe('findPublishBlockers', () => {
  it('clears a complete portfolio', () => {
    expect(findPublishBlockers(buildFullPortfolioDocument())).toEqual([]);
    expect(isPublishable(buildFullPortfolioDocument())).toBe(true);
  });

  it('refuses a portfolio with no name', () => {
    const document = buildFullPortfolioDocument();

    const blockers = findPublishBlockers({
      ...document,
      identity: { ...document.identity, displayName: ' '.repeat(3) },
    });

    expect(blockers).toContain('missing-name');
  });

  it('treats a whitespace-only headline as a missing one', () => {
    const document = buildFullPortfolioDocument();

    const blockers = findPublishBlockers({
      ...document,
      identity: { ...document.identity, headline: '  \t ' },
    });

    expect(blockers).toContain('missing-headline');
  });

  it('refuses a portfolio that is only a hero', () => {
    const blockers = findPublishBlockers(stripContent(buildFullPortfolioDocument()));

    expect(blockers).toContain('empty-portfolio');
  });

  // A published home page nobody can reach is a 404 with a success message.
  it('refuses to publish when the home page is hidden', () => {
    const document = buildFullPortfolioDocument();

    const blockers = findPublishBlockers({
      ...document,
      pages: document.pages.map((page) => (page.slug === '' ? { ...page, visible: false } : page)),
    });

    expect(blockers).toContain('no-visible-home-page');
  });

  it('reports every blocker at once rather than one per attempt', () => {
    const document = stripContent(buildMinimalPortfolioDocument());

    const blockers = findPublishBlockers({
      ...document,
      identity: { ...document.identity, displayName: '', headline: null },
    });

    expect(blockers).toEqual(
      expect.arrayContaining(['missing-name', 'missing-headline', 'empty-portfolio']),
    );
    expect(isPublishable(document)).toBe(false);
  });
});

describe('hasAnyContent', () => {
  it('counts a summary on its own as content', () => {
    const document = stripContent(buildFullPortfolioDocument());

    expect(
      hasAnyContent({
        ...document,
        identity: { ...document.identity, summary: 'One paragraph about my work.' },
      }),
    ).toBe(true);
  });

  it('does not count a whitespace summary', () => {
    const document = stripContent(buildFullPortfolioDocument());

    expect(
      hasAnyContent({ ...document, identity: { ...document.identity, summary: '\n  ' } }),
    ).toBe(false);
  });

  // A graduate with three skills has a portfolio; the bar is content, not a CV.
  it('counts a single non-empty skill group', () => {
    const document = stripContent(buildFullPortfolioDocument());

    expect(
      hasAnyContent({
        ...document,
        skills: [{ id: 'skills-1', label: 'Languages', tier: 'primary', items: ['TypeScript'] }],
      }),
    ).toBe(true);
  });

  it('does not count an empty skill group', () => {
    const document = stripContent(buildFullPortfolioDocument());

    expect(
      hasAnyContent({
        ...document,
        skills: [{ id: 'skills-1', label: 'Languages', tier: 'primary', items: [] }],
      }),
    ).toBe(false);
  });
});
