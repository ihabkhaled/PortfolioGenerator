import type { IdentifiedCollectionKey } from '../types/collection-edit.types';

export function isRequiredCollectionField(key: IdentifiedCollectionKey, field: string): boolean {
  switch (key) {
    case 'experience': {
      return field === 'organization' || field === 'title';
    }
    case 'projects': {
      return field === 'name';
    }
    case 'skills':
    case 'softSkills': {
      return field === 'label' || field === 'tier';
    }
    case 'education': {
      return field === 'institution';
    }
    case 'courses':
    case 'certifications':
    case 'languages':
    case 'awards': {
      return field === 'name';
    }
    case 'publications': {
      return field === 'title';
    }
    case 'volunteering': {
      return field === 'organization';
    }
    case 'testimonials': {
      return field === 'quote' || field === 'author';
    }
    case 'socialLinks': {
      return field === 'kind' || field === 'url';
    }
  }
}

export function formatCollectionEntry(entry: unknown): string {
  if (typeof entry === 'string') return entry;
  if (!isStringRecord(entry)) return '';
  if (entry['kind'] === 'paragraph' && typeof entry['text'] === 'string') return entry['text'];
  if (typeof entry['url'] === 'string' && typeof entry['label'] === 'string') {
    return `${entry['label']} | ${entry['url']}`;
  }
  return '';
}

export function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((entry: unknown) => typeof entry === 'string');
}

export function isStringRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
