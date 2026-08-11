import type {
  CollectionFieldDefinition,
  IdentifiedCollectionKey,
} from '../types/collection-edit.types';
import type { EditorActionState } from '../types/editor.types';

export const ARIA_LIVE_POLITE = 'polite' as const;
export const EDITOR_ISSUE_MESSAGE_ID = 'editor-current-issue-message';
export const IDENTITY_DISPLAY_NAME_LABEL_ID = 'identity-display-name-label';
export const EDITOR_ISSUE_DIRECT_CONTROLS: Readonly<Record<string, string>> = {
  'identity.displayName': 'identity-display-name',
  'identity.tagline': 'identity-tagline',
  'identity.availabilityNote': 'identity-availability-note',
  'identity.availabilityEnabled': 'identity-availability-enabled',
  'identity.headline': 'identity-headline',
  'identity.location': 'identity-location',
  'identity.nationality': 'identity-nationality',
  'identity.militaryStatus': 'identity-military-status',
  'identity.summary': 'identity-summary',
  'identity.coverLetter': 'identity-cover-letter',
  'contact.email.value': 'contact-email',
  'contact.phone.countryIso': 'contact-phone-country',
  'contact.phone.nationalNumber': 'contact-phone',
  'seo.title': 'seo-title',
  'seo.description': 'seo-description',
  interests: 'portfolio-interests',
};

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
    { name: 'organization', kind: 'text', required: true },
    { name: 'title', kind: 'text', required: true },
    { name: 'location', kind: 'text' },
    { name: 'startDate', kind: 'month' },
    { name: 'endDate', kind: 'month' },
    { name: 'current', kind: 'boolean' },
    { name: 'summary', kind: 'textarea' },
    { name: 'highlights', kind: 'list' },
    { name: 'technologies', kind: 'list' },
  ],
  projects: [
    { name: 'name', kind: 'text', required: true },
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
    { name: 'label', kind: 'text', required: true },
    { name: 'tier', kind: 'skill-tier', required: true },
    { name: 'items', kind: 'list' },
  ],
  softSkills: [
    { name: 'label', kind: 'text', required: true },
    { name: 'detail', kind: 'textarea' },
  ],
  education: [
    { name: 'institution', kind: 'text', required: true },
    { name: 'degree', kind: 'text' },
    { name: 'field', kind: 'text' },
    { name: 'startDate', kind: 'month' },
    { name: 'endDate', kind: 'month' },
    { name: 'location', kind: 'text' },
    { name: 'details', kind: 'textarea' },
  ],
  courses: [
    { name: 'name', kind: 'text', required: true },
    { name: 'provider', kind: 'text' },
    { name: 'date', kind: 'month' },
    { name: 'url', kind: 'text' },
    { name: 'summary', kind: 'textarea' },
  ],
  certifications: [
    { name: 'name', kind: 'text', required: true },
    { name: 'issuer', kind: 'text' },
    { name: 'date', kind: 'month' },
    { name: 'credentialUrl', kind: 'text' },
  ],
  languages: [
    { name: 'name', kind: 'text', required: true },
    { name: 'proficiency', kind: 'text' },
  ],
  awards: [
    { name: 'name', kind: 'text', required: true },
    { name: 'issuer', kind: 'text' },
    { name: 'date', kind: 'month' },
    { name: 'description', kind: 'textarea' },
  ],
  publications: [
    { name: 'title', kind: 'text', required: true },
    { name: 'publisher', kind: 'text' },
    { name: 'date', kind: 'month' },
    { name: 'url', kind: 'text' },
    { name: 'summary', kind: 'textarea' },
  ],
  volunteering: [
    { name: 'organization', kind: 'text', required: true },
    { name: 'role', kind: 'text' },
    { name: 'startDate', kind: 'month' },
    { name: 'endDate', kind: 'month' },
    { name: 'summary', kind: 'textarea' },
  ],
  testimonials: [
    { name: 'quote', kind: 'textarea', required: true },
    { name: 'author', kind: 'text', required: true },
    { name: 'role', kind: 'text' },
    { name: 'organization', kind: 'text' },
  ],
  socialLinks: [
    { name: 'kind', kind: 'social-kind', required: true },
    { name: 'url', kind: 'text', required: true },
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
