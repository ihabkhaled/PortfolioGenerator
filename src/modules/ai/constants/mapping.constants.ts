/**
 * Display labels for the link kinds the extractor reports.
 *
 * A lookup rather than a per-host guess: deriving "GitHub" from a hostname
 * means deriving something wrong from an unfamiliar one, and an unrecognised
 * kind falling through to its own name is honest.
 */
export const LINK_LABELS: Readonly<Record<string, string>> = {
  code: 'Code',
  github: 'GitHub',
  gitlab: 'GitLab',
  linkedin: 'LinkedIn',
  website: 'Website',
  portfolio: 'Portfolio',
  blog: 'Blog',
  writing: 'Writing',
  project: 'Project',
  link: 'Link',
};

/**
 * Imported skills land in one group.
 *
 * Splitting them by discipline is a judgement the user is far better placed to
 * make, and a wrong grouping is more work to undo than to do.
 */
export const DEFAULT_SKILL_GROUP_LABEL = 'Skills';

export const IMPORTED_PAGE_DEFINITIONS = {
  experience: { slug: 'experience', title: 'Experience', sectionTypes: ['experience'] },
  projects: { slug: 'projects', title: 'Projects', sectionTypes: ['projects'] },
  skills: { slug: 'skills', title: 'Skills', sectionTypes: ['skills', 'languages'] },
  about: {
    slug: 'about',
    title: 'About',
    sectionTypes: ['about', 'education', 'certifications'],
  },
  contact: { slug: 'contact', title: 'Contact', sectionTypes: ['contact'] },
} as const;
