import type {
  CollectionFieldDefinition,
  IdentifiedCollectionKey,
} from '../types/collection-edit.types';
import type { EditorActionState } from '../types/editor.types';

export const EDITOR_COLLECTION_KEYS: readonly IdentifiedCollectionKey[] = [
  'experience',
  'projects',
  'skills',
  'softSkills',
  'education',
  'courses',
  'certifications',
  'languages',
  'awards',
  'publications',
  'volunteering',
  'testimonials',
  'socialLinks',
];

export const EDITOR_COLLECTION_FIELDS: Readonly<
  Record<IdentifiedCollectionKey, readonly CollectionFieldDefinition[]>
> = {
  experience: [
    { name: 'organization', kind: 'text' },
    { name: 'title', kind: 'text' },
    { name: 'location', kind: 'text' },
    { name: 'startDate', kind: 'month' },
    { name: 'endDate', kind: 'month' },
    { name: 'current', kind: 'boolean' },
    { name: 'summary', kind: 'textarea' },
    { name: 'highlights', kind: 'list' },
    { name: 'technologies', kind: 'list' },
  ],
  projects: [
    { name: 'name', kind: 'text' },
    { name: 'slug', kind: 'text' },
    { name: 'role', kind: 'text' },
    { name: 'year', kind: 'text' },
    { name: 'featured', kind: 'boolean' },
    { name: 'summary', kind: 'textarea' },
    { name: 'highlights', kind: 'list' },
    { name: 'technologies', kind: 'list' },
    { name: 'links', kind: 'project-links' },
    { name: 'content', kind: 'project-content' },
  ],
  skills: [
    { name: 'label', kind: 'text' },
    { name: 'tier', kind: 'skill-tier' },
    { name: 'items', kind: 'list' },
  ],
  softSkills: [
    { name: 'label', kind: 'text' },
    { name: 'detail', kind: 'textarea' },
  ],
  education: [
    { name: 'institution', kind: 'text' },
    { name: 'degree', kind: 'text' },
    { name: 'field', kind: 'text' },
    { name: 'startDate', kind: 'month' },
    { name: 'endDate', kind: 'month' },
    { name: 'location', kind: 'text' },
    { name: 'details', kind: 'textarea' },
  ],
  courses: [
    { name: 'name', kind: 'text' },
    { name: 'provider', kind: 'text' },
    { name: 'date', kind: 'month' },
    { name: 'url', kind: 'text' },
    { name: 'summary', kind: 'textarea' },
  ],
  certifications: [
    { name: 'name', kind: 'text' },
    { name: 'issuer', kind: 'text' },
    { name: 'date', kind: 'month' },
    { name: 'credentialUrl', kind: 'text' },
  ],
  languages: [
    { name: 'name', kind: 'text' },
    { name: 'proficiency', kind: 'text' },
  ],
  awards: [
    { name: 'name', kind: 'text' },
    { name: 'issuer', kind: 'text' },
    { name: 'date', kind: 'month' },
    { name: 'description', kind: 'textarea' },
  ],
  publications: [
    { name: 'title', kind: 'text' },
    { name: 'publisher', kind: 'text' },
    { name: 'date', kind: 'month' },
    { name: 'url', kind: 'text' },
    { name: 'summary', kind: 'textarea' },
  ],
  volunteering: [
    { name: 'organization', kind: 'text' },
    { name: 'role', kind: 'text' },
    { name: 'startDate', kind: 'month' },
    { name: 'endDate', kind: 'month' },
    { name: 'summary', kind: 'textarea' },
  ],
  testimonials: [
    { name: 'quote', kind: 'textarea' },
    { name: 'author', kind: 'text' },
    { name: 'role', kind: 'text' },
    { name: 'organization', kind: 'text' },
  ],
  socialLinks: [
    { name: 'kind', kind: 'social-kind' },
    { name: 'url', kind: 'text' },
    { name: 'label', kind: 'text' },
    { name: 'visible', kind: 'boolean' },
  ],
};

export const EDITOR_SOCIAL_KINDS = [
  'github',
  'gitlab',
  'linkedin',
  'behance',
  'dribbble',
  'youtube',
  'tiktok',
  'instagram',
  'facebook',
  'x',
  'threads',
  'medium',
  'stackoverflow',
  'telegram',
  'whatsapp',
  'website',
  'mastodon',
  'bluesky',
] as const;
export const EDITOR_SKILL_TIERS = ['primary', 'strong', 'working', 'familiar'] as const;

export const EDITOR_INITIAL_STATE: EditorActionState = {
  status: 'idle',
  error: null,
  version: null,
};

/**
 * Failure keys, one per reason.
 *
 * `versionConflict` in particular gets its own message because the recovery is
 * specific and non-obvious: reload, because someone (often the same person in
 * another tab) already changed this.
 */
export const EDITOR_ERROR_KEYS = {
  invalidDocument: 'errors.invalidDocument',
  versionConflict: 'errors.versionConflict',
  'not-found': 'errors.notFound',
  notFound: 'errors.notFound',
  'not-ready': 'errors.notReady',
  'slug-taken': 'errors.slugTaken',
  'invalid-slug': 'errors.invalidSlug',
  invalidSlug: 'errors.invalidSlug',
  'invalid-document': 'errors.invalidDocument',
} as const;

/** Debounce for the slug availability check, in milliseconds. */
export const SLUG_CHECK_DEBOUNCE_MS = 400;

export const EDITOR_ATTACHMENT_KINDS = [
  'cv',
  'cover-letter',
  'certificate',
  'portfolio',
  'reference',
  'other',
] as const;
