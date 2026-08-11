import type { PortfolioDocument } from '@/modules/portfolio-document';

export type IdentifiedCollectionKey =
  | 'experience'
  | 'projects'
  | 'skills'
  | 'softSkills'
  | 'education'
  | 'courses'
  | 'certifications'
  | 'languages'
  | 'awards'
  | 'publications'
  | 'volunteering'
  | 'testimonials'
  | 'socialLinks';

export type CollectionItem<TKey extends IdentifiedCollectionKey> = PortfolioDocument[TKey][number];
export type AnyCollectionItem = PortfolioDocument[IdentifiedCollectionKey][number];

export type CollectionFieldKind =
  | 'text'
  | 'month'
  | 'textarea'
  | 'list'
  | 'boolean'
  | 'social-kind'
  | 'skill-tier'
  | 'project-content'
  | 'project-links';
export interface CollectionFieldDefinition {
  readonly name: string;
  readonly kind: CollectionFieldKind;
  readonly required?: boolean;
}

export interface CreatePageInput {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly navLabel: string;
}
