import { isRecord } from './portfolio-document-v2.migration';

/**
 * Version 2 → version 3.
 *
 * Every contact section ever created — by `createEmptyPortfolioDocument`, by
 * the CV-import mapper, and so by every document this application has ever
 * written — was given `config.showPhone: false` by a bug, with no editor
 * control anywhere that could ever change it. A person could turn on "show
 * phone on my public page" for the field itself and it would still never
 * render, because a second, inaccessible gate silently overrode the one they
 * could see. Fixing the default going forward (see `DEFAULT_HOME_SECTIONS`)
 * does nothing for a portfolio that already exists — this migration is what
 * reaches those. It sets the same value the corrected default now uses; a
 * document that goes through this step ends up identical to one created
 * fresh, not merely patched.
 */
export function upgradeDocumentToVersion3(input: unknown): unknown {
  if (!isRecord(input)) {
    return input;
  }

  return {
    ...input,
    schemaVersion: 3,
    pages: upgradePages(input['pages']),
  };
}

function upgradePages(pages: unknown): unknown {
  if (!Array.isArray(pages)) {
    return pages;
  }

  return (pages as unknown[]).map((page) =>
    isRecord(page) ? { ...page, sections: upgradeSections(page['sections']) } : page,
  );
}

function upgradeSections(sections: unknown): unknown {
  if (!Array.isArray(sections)) {
    return sections;
  }

  return (sections as unknown[]).map((section) => {
    if (!isRecord(section) || section['type'] !== 'contact' || !isRecord(section['config'])) {
      return section;
    }

    return { ...section, config: { ...section['config'], showPhone: true } };
  });
}
