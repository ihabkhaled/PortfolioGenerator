import {
  BULLET_MARKERS,
  TRAILING_PUNCTUATION,
  CURRENT_ROLE_MARKERS,
  MONTH_NAMES,
  ROLE_SEPARATORS,
  SECTION_HEADINGS,
} from '../constants/deterministic.constants';
import { WARNING_CODES } from '../constants/extraction.constants';
import type { ResumeExtractionResult } from '../types/ai-provider.types';
import type {
  ParsedDateRange,
  ParsedExperience,
  ParsedRoleLine,
  ResumeSection,
} from '../types/deterministic.types';

/**
 * A rule-based resume parser used offline and in CI.
 *
 * Held to the same contract as the model: report what the text says, use null
 * where it says nothing, and record what could not be read as a warning. It is
 * not trying to be clever — an entry it cannot parse confidently is dropped
 * with a warning rather than guessed at, because a wrong job title that a user
 * skims past is worse than a missing one they notice.
 */

export function splitIntoSections(text: string): readonly ResumeSection[] {
  const lines = text.split('\n');
  const sections: ResumeSection[] = [];
  let current: { heading: string; lines: string[] } = { heading: 'header', lines: [] };

  for (const line of lines) {
    const heading = matchHeading(line);

    if (heading === null) {
      current.lines.push(line);

      continue;
    }

    sections.push({ heading: current.heading, lines: current.lines });
    current = { heading, lines: [] };
  }

  sections.push({ heading: current.heading, lines: current.lines });

  return sections.filter((section) => section.lines.some((line) => line.trim() !== ''));
}

/**
 * A heading is a short line that matches a known section name. The length bound
 * matters: "Experience designing payment systems" is a summary sentence, not a
 * heading, and treating it as one would swallow the section beneath it.
 */
export function matchHeading(line: string): string | null {
  const normalized = line.trim().toLowerCase().replace(/:$/u, '');

  if (normalized.length === 0 || normalized.length > 40) {
    return null;
  }

  for (const [section, names] of Object.entries(SECTION_HEADINGS)) {
    if ((names as readonly string[]).includes(normalized)) {
      return section;
    }
  }

  return null;
}

export function sectionLines(
  sections: readonly ResumeSection[],
  heading: string,
): readonly string[] {
  return sections
    .filter((section) => section.heading === heading)
    .flatMap((section) => section.lines)
    .map((line) => line.trim())
    .filter((line) => line !== '');
}

/**
 * Drop the punctuation a CV writer wrapped a token in — "(https://example.com)."
 * or "<amina@example.com>" — from both ends.
 *
 * A bounded scan rather than an anchored `[...]+$` pattern, which backtracks on
 * a long run of them, and both ends rather than just the trailing one: a URL
 * inside parentheses fails a `startsWith('https://')` check if only its tail is
 * cleaned, and silently disappears from the import.
 */
export function stripSurroundingPunctuation(token: string): string {
  let start = 0;
  let end = token.length;

  while (start < end && TRAILING_PUNCTUATION.includes(token[start] ?? '')) {
    start += 1;
  }

  while (end > start && TRAILING_PUNCTUATION.includes(token[end - 1] ?? '')) {
    end -= 1;
  }

  return token.slice(start, end);
}

export function isBullet(line: string): boolean {
  return BULLET_MARKERS.some((marker) => line.startsWith(marker));
}

export function stripBullet(line: string): string {
  for (const marker of BULLET_MARKERS) {
    if (line.startsWith(marker)) {
      return line.slice(marker.length).trim();
    }
  }

  return line.trim();
}

/** `Jan 2024`, `January 2024`, `2024-01` and `01/2024` all become `2024-01`. */
export function parseMonth(value: string): string | null {
  const trimmed = value.trim().toLowerCase();

  const isoMatch = /^(\d{4})-(\d{1,2})$/u.exec(trimmed);

  if (isoMatch?.[1] !== undefined && isoMatch[2] !== undefined) {
    return formatMonthParts(isoMatch[1], Number(isoMatch[2]));
  }

  const slashMatch = /^(\d{1,2})\/(\d{4})$/u.exec(trimmed);

  if (slashMatch?.[1] !== undefined && slashMatch[2] !== undefined) {
    return formatMonthParts(slashMatch[2], Number(slashMatch[1]));
  }

  const nameMatch = /^([a-z]+)\.?\s+(\d{4})$/u.exec(trimmed);

  if (nameMatch?.[1] !== undefined && nameMatch[2] !== undefined) {
    const index = MONTH_NAMES.findIndex((name) => name.startsWith(nameMatch[1] ?? ''));

    return index === -1 ? null : formatMonthParts(nameMatch[2], index + 1);
  }

  // A bare year is deliberately not upgraded to January: inventing a month is
  // exactly the kind of plausible wrong fact this pipeline exists to avoid.
  return null;
}

export function formatMonthParts(year: string, month: number): string | null {
  if (month < 1 || month > 12) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}`;
}

export function isCurrentMarker(value: string): boolean {
  return CURRENT_ROLE_MARKERS.includes(value.trim().toLowerCase() as never);
}

/** `2020-06 — 2023-02`, `Jan 2020 - Present`, and the one-sided variants. */
export function parseDateRange(line: string): ParsedDateRange {
  for (const separator of ROLE_SEPARATORS) {
    if (!line.includes(separator)) {
      continue;
    }

    const [rawStart, rawEnd] = line.split(separator, 2);

    if (rawStart === undefined || rawEnd === undefined) {
      continue;
    }

    const startDate = parseMonth(rawStart);
    const current = isCurrentMarker(rawEnd);
    const endDate = current ? null : parseMonth(rawEnd);

    if (startDate !== null || endDate !== null || current) {
      return { startDate, endDate, current, matched: true };
    }
  }

  return { startDate: null, endDate: null, current: false, matched: false };
}

/**
 * The first email-shaped token in the document.
 *
 * Split on whitespace and inspect each token rather than running a pattern
 * over the whole text: the obvious email regex nests quantifiers around `@`
 * and backtracks super-linearly, and this runs on an untrusted 60 000-character
 * upload.
 */
export function findEmail(text: string): string | null {
  for (const token of text.split(/\s+/u)) {
    const candidate = stripSurroundingPunctuation(token);
    const at = candidate.indexOf('@');

    if (at <= 0 || at !== candidate.lastIndexOf('@')) {
      continue;
    }

    const domain = candidate.slice(at + 1);

    if (!domain.startsWith('.') && !domain.endsWith('.') && domain.includes('.')) {
      return candidate;
    }
  }

  return null;
}

export function findUrls(text: string): readonly string[] {
  return text
    .split(/\s+/u)
    .map((token) => stripSurroundingPunctuation(token))
    .filter((token) => token.startsWith('https://') && token.length > 'https://'.length);
}

/**
 * Split an `Organisation — Title` line. Returns nulls when the shape is not
 * recognised, so the caller can drop the entry with a warning rather than
 * assign the whole line to one field and hope.
 */
export function splitRoleLine(line: string): ParsedRoleLine {
  for (const separator of ROLE_SEPARATORS) {
    if (!line.includes(separator)) {
      continue;
    }

    const [left, right] = line.split(separator, 2);

    if (left?.trim() && right?.trim()) {
      return { organization: left.trim(), title: right.trim() };
    }
  }

  // "Backend Engineer at Northwind" — split on the first standalone "at"
  // rather than with a pattern whose two `.+` groups can trade characters
  // with the whitespace between them and backtrack.
  const words = line.trim().split(' ');
  const atIndex = words.indexOf('at');

  if (atIndex > 0 && atIndex < words.length - 1) {
    return {
      organization: words
        .slice(atIndex + 1)
        .join(' ')
        .trim(),
      title: words.slice(0, atIndex).join(' ').trim(),
    };
  }

  return { organization: null, title: null };
}

export function parseSkills(lines: readonly string[]): readonly string[] {
  const items = lines.flatMap((line) => stripBullet(line).split(/[,;•]/u));

  return [...new Set(items.map((item) => item.trim()).filter((item) => item.length > 0))];
}

export function parseExperience(lines: readonly string[]): ParsedExperience {
  const entries: ResumeExtractionResult['experience'] = [];
  const warnings: ResumeExtractionResult['warnings'] = [];

  for (const line of lines) {
    if (isBullet(line)) {
      const last = entries.at(-1);

      if (last) {
        last.highlights.push(stripBullet(line));
      }

      continue;
    }

    const range = parseDateRange(line);
    const last = entries.at(-1);

    if (last && range.matched) {
      last.startDate = range.startDate;
      last.endDate = range.endDate;
      last.current = range.current;

      if (range.startDate === null && !range.current) {
        warnings.push({
          code: WARNING_CODES.ambiguousDate,
          path: `experience.${entries.length - 1}.startDate`,
          message: 'The start date could not be read confidently.',
        });
      }

      continue;
    }

    const { organization, title } = splitRoleLine(line);

    if (organization === null || title === null) {
      warnings.push({
        code: WARNING_CODES.droppedIncompleteEntry,
        path: `experience.${entries.length}`,
        message: 'A line in the experience section could not be read as a role.',
      });

      continue;
    }

    entries.push({
      organization,
      title,
      location: null,
      startDate: null,
      endDate: null,
      current: false,
      summary: null,
      highlights: [],
      technologies: [],
    });
  }

  return { entries, warnings };
}

export function parseDeterministicResume(resumeText: string): ResumeExtractionResult {
  const sections = splitIntoSections(resumeText);
  const headerLines = sectionLines(sections, 'header');
  const [displayName = null, headline = null] = headerLines;
  const experience = parseExperience(sectionLines(sections, 'experience'));
  const summaryLines = sectionLines(sections, 'summary');
  const warnings = [...experience.warnings];

  if (headline === null) {
    warnings.push({
      code: WARNING_CODES.missingHeadline,
      path: 'identity.headline',
      message: 'No professional headline was found near the top of the document.',
    });
  }

  return {
    identity: {
      displayName,
      headline,
      summary: summaryLines.length === 0 ? null : summaryLines.join('\n'),
      location: null,
    },
    contact: {
      email: findEmail(resumeText),
      phone: null,
    },
    links: findUrls(resumeText).map((url) => ({ kind: 'link', url })),
    experience: experience.entries,
    projects: [],
    skills: [...parseSkills(sectionLines(sections, 'skills'))],
    education: [],
    certifications: [],
    languages: [],
    awards: [],
    warnings,
  };
}
