import { DEFAULT_SOCIAL_KIND_BY_LINK_KIND } from '../constants/portfolio-social-kind.constants';
import type { LegacyRecord } from '../types/portfolio-migration.types';

/**
 * Version 1 → version 2.
 *
 * The first real migration, and a demonstration of the contract every later one
 * inherits: it takes unknown JSON, adds what version 2 requires, and never
 * invents a claim. Every new field defaults to the value that means "the person
 * has not said" — `null`, `[]`, `false` — because a migration that guessed
 * would put words on someone's public page that they never wrote.
 *
 * It is deliberately defensive about shape. The input is whatever an older
 * build wrote, which is not necessarily what that build's schema said: a row
 * can predate a bug fix, or have been edited by hand during an incident.
 */
export function upgradeDocumentToVersion2(input: unknown): unknown {
  if (!isRecord(input)) {
    return input;
  }

  return {
    ...input,
    schemaVersion: 2,
    identity: upgradeIdentity(input['identity']),
    contact: upgradeContact(input['contact']),
    socialLinks: deriveSocialLinks(input['links']),
    projects: upgradeProjects(input['projects']),
    skills: upgradeSkills(input['skills']),
    pages: upgradePages(input['pages']),
    softSkills: [],
    courses: [],
    publications: [],
    volunteering: [],
    testimonials: [],
    interests: [],
    gallery: [],
    attachments: [],
  };
}

export function isRecord(value: unknown): value is LegacyRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function upgradeIdentity(identity: unknown): unknown {
  if (!isRecord(identity)) {
    return identity;
  }

  return { ...identity, tagline: null, availabilityNote: null, coverLetter: null };
}

/**
 * A version 1 phone was one string, which may or may not have carried a
 * dialling prefix. It moves to `nationalNumber` whole.
 *
 * The country is *not* inferred from a leading `+`: several prefixes cover more
 * than one country, and a migration that guessed would stamp a wrong country
 * onto a real person's contact details silently. `null` means "ask them", and
 * the editor does.
 */
export function upgradeContact(contact: unknown): unknown {
  if (!isRecord(contact)) {
    return contact;
  }

  const phone = isRecord(contact['phone']) ? contact['phone'] : {};
  const legacyValue = typeof phone['value'] === 'string' ? phone['value'] : null;

  return {
    ...contact,
    phone: {
      countryIso: null,
      nationalNumber: legacyValue,
      visible: phone['visible'] === true,
    },
  };
}

/**
 * Version 1 kept every URL in one `links` array with a free-text `kind`.
 *
 * Where that kind names a platform version 2 recognises, the link becomes a
 * social profile so it renders as a mark. Anything else stays in `links`,
 * untouched — a migration that dropped a link a person had added would lose
 * their content to gain a tidier shape.
 */
export function deriveSocialLinks(links: unknown): unknown[] {
  if (!Array.isArray(links)) {
    return [];
  }

  const seen = new Set<string>();
  const social: unknown[] = [];

  for (const link of links) {
    if (!isRecord(link) || typeof link['kind'] !== 'string') {
      continue;
    }

    const socialKind = DEFAULT_SOCIAL_KIND_BY_LINK_KIND[link['kind'].toLowerCase()];

    if (socialKind === undefined || seen.has(socialKind)) {
      continue;
    }

    seen.add(socialKind);
    social.push({
      id: `social-${socialKind}`,
      kind: socialKind,
      label: typeof link['label'] === 'string' ? link['label'] : null,
      url: link['url'],
      visible: link['visible'] !== false,
    });
  }

  return social;
}

export function upgradeProjects(projects: unknown): unknown {
  if (!Array.isArray(projects)) {
    return projects;
  }

  return (projects as unknown[]).map((project) =>
    isRecord(project)
      ? {
          ...project,
          slug: null,
          role: null,
          year: null,
          coverAssetId: null,
          featured: false,
          content: [],
        }
      : project,
  );
}

/**
 * Version 1 skill groups made no claim about depth.
 *
 * `working` is the tier that says the least: real features delivered. Promoting
 * an existing group to `primary` would be the migration asserting expertise on
 * the person's behalf.
 */
export function upgradeSkills(skills: unknown): unknown {
  if (!Array.isArray(skills)) {
    return skills;
  }

  return (skills as unknown[]).map((group) =>
    isRecord(group) ? { ...group, tier: 'working' } : group,
  );
}

/** Every existing page was reachable by anyone, which is what `public` means. */
export function upgradePages(pages: unknown): unknown {
  if (!Array.isArray(pages)) {
    return pages;
  }

  return (pages as unknown[]).map((page) =>
    isRecord(page)
      ? { ...page, description: null, visibility: 'public', passwordHash: null }
      : page,
  );
}
