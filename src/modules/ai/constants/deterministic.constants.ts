export const DETERMINISTIC_PROVIDER_NAME = 'deterministic';

/**
 * Section headings the offline parser recognises, lowercased.
 *
 * A real CV parser would need far more than this. The purpose here is a
 * dependable pipeline for CI and offline development, so the list covers the
 * headings that appear on almost every English CV and stops there rather than
 * pretending to be a product.
 */
export const SECTION_HEADINGS = {
  summary: ['summary', 'profile', 'about', 'objective'],
  experience: ['experience', 'employment', 'work history', 'professional experience'],
  projects: ['projects', 'selected projects', 'portfolio'],
  skills: ['skills', 'technical skills', 'technologies'],
  education: ['education', 'academic background'],
  certifications: ['certifications', 'certificates', 'licenses'],
  languages: ['languages'],
  awards: ['awards', 'honours', 'honors'],
  publications: ['publications', 'writing'],
  volunteering: ['volunteering', 'volunteer experience', 'community service'],
  interests: ['interests', 'hobbies'],
  testimonials: ['testimonials', 'references'],
  gallery: ['gallery', 'media', 'portfolio media'],
  attachments: ['attachments', 'downloads', 'documents'],
  custom: ['custom page', 'custom section'],
} as const;

/** `Company — Title` / `Title at Company`, the two shapes worth handling. */
export const ROLE_SEPARATORS = [' — ', ' – ', ' - ', ' | '] as const;

export const CURRENT_ROLE_MARKERS = ['present', 'current', 'now', 'ongoing'] as const;

export const BULLET_MARKERS = ['•', '-', '*', '·', '‣'] as const;

/**
 * The longest a parsed skill may be.
 *
 * "Distributed systems architecture" is 32 characters; a sentence is not a
 * skill. The bound is what stops a trailing paragraph from being swallowed by
 * an unterminated skills section.
 */
export const MAX_SKILL_LENGTH = 60;

/** Punctuation a CV writer leaves on the end of an email or URL. */
export const TRAILING_PUNCTUATION: readonly string[] = [
  '.',
  ',',
  ';',
  ':',
  '<',
  '>',
  '(',
  ')',
  '[',
  ']',
];

/** `Jan 2024`, `January 2024`, `2024-01`, `01/2024`. */
export const MONTH_NAMES = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;
