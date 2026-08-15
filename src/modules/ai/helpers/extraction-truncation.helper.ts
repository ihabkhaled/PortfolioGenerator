import { DOCUMENT_COUNTS } from '@/modules/portfolio-document';

import { WARNING_CODES } from '../constants/extraction.constants';
import type { ResumeExtractionResult } from '../types/ai-provider.types';
import type { ExtractionMappingResult } from '../types/mapping.types';

export function reportCollectionTruncations(
  extraction: ResumeExtractionResult,
  warnings: ExtractionMappingResult['warnings'],
): void {
  const limits: readonly (readonly [string, readonly unknown[], number])[] = [
    ['links', extraction.links, DOCUMENT_COUNTS.links],
    ['experience', extraction.experience, DOCUMENT_COUNTS.experience],
    ['projects', extraction.projects, DOCUMENT_COUNTS.projects],
    ['skills', extraction.skills, DOCUMENT_COUNTS.skillItems],
    ['softSkills', extraction.softSkills, DOCUMENT_COUNTS.softSkills],
    ['education', extraction.education, DOCUMENT_COUNTS.education],
    ['courses', extraction.courses, DOCUMENT_COUNTS.courses],
    ['certifications', extraction.certifications, DOCUMENT_COUNTS.certifications],
    ['languages', extraction.languages, DOCUMENT_COUNTS.languages],
    ['awards', extraction.awards, DOCUMENT_COUNTS.awards],
    ['publications', extraction.publications, DOCUMENT_COUNTS.publications],
    ['volunteering', extraction.volunteering, DOCUMENT_COUNTS.volunteering],
    ['interests', extraction.interests, DOCUMENT_COUNTS.interests],
  ];
  for (const [path, entries, limit] of limits)
    if (entries.length > limit)
      warnings.push({
        code: WARNING_CODES.truncatedInput,
        path,
        message: `Additional ${path} were omitted after the ${limit}-item limit.`,
      });
}

export function boundedNestedList<T>(
  entries: readonly T[],
  limit: number,
  path: string,
  warnings: ExtractionMappingResult['warnings'],
): T[] {
  if (entries.length > limit)
    warnings.push({
      code: WARNING_CODES.truncatedInput,
      path,
      message: `Additional ${path.split('.').at(-1)} were omitted after the ${limit}-item limit.`,
    });
  return entries.slice(0, limit);
}
