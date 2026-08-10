import { COUNTRY_DIAL_CODES } from '@/shared/constants/country-codes.constants';
import type {
  CountryDialCode,
  SplitInternationalPhoneResult,
} from '@/shared/types/country-code.types';

/**
 * Phone numbers, treated as text a reader copies.
 *
 * No parsing, no national-format guessing, no validation against a numbering
 * plan. The product's job is to keep the country the person chose next to the
 * number they typed, and to render the pair unambiguously.
 */

export function findCountryByIso(iso: string | null): CountryDialCode | null {
  if (iso === null) {
    return null;
  }

  return COUNTRY_DIAL_CODES.find((country) => country.iso === iso) ?? null;
}

/**
 * A flag for the reader's eye, derived rather than stored.
 *
 * Each ISO letter maps to its Unicode regional indicator symbol — `EG`
 * becomes 🇪🇬 — so there is no image asset and no second list of flags that
 * could drift from `COUNTRY_DIAL_CODES`. Every entry in that list is a real
 * two-letter ISO 3166-1 code, so the mapping always produces a flag.
 */
export function countryFlagEmoji(iso: string): string {
  return String.fromCodePoint(
    ...Array.from(iso.toUpperCase(), (letter) => 127_397 + (letter.codePointAt(0) ?? 0)),
  );
}

/**
 * `🇪🇬 (+20) 100-156-8256`.
 *
 * The prefix is bracketed rather than run together with the number, because a
 * reader dialling internationally needs to see where the country code ends —
 * and because a bare `+20100...` is trivially misread by one digit.
 */
export function formatPhoneNumber(
  iso: string | null,
  nationalNumber: string | null,
): string | null {
  const trimmed = nationalNumber?.trim() ?? '';

  if (trimmed === '') {
    return null;
  }

  const country = findCountryByIso(iso);

  return country === null
    ? trimmed
    : `${countryFlagEmoji(country.iso)} (${country.dial}) ${trimmed}`;
}

/** The `tel:` target. Punctuation a human reads is noise to a dialler. */
export function toTelHref(iso: string | null, nationalNumber: string | null): string | null {
  const trimmed = nationalNumber?.trim() ?? '';

  if (trimmed === '') {
    return null;
  }

  const digits = trimmed.replaceAll(/\D/gu, '');
  const country = findCountryByIso(iso);

  return country === null ? `tel:${digits}` : `tel:${country.dial}${digits}`;
}

/** Countries in the reader's alphabetical order, not the file's. */
export function sortCountriesByName(locale: string): readonly CountryDialCode[] {
  return [...COUNTRY_DIAL_CODES].toSorted((left, right) =>
    left.name.localeCompare(right.name, locale),
  );
}

/**
 * Separates an explicit international prefix only when it identifies one ISO
 * entry. Shared calling plans preserve the complete evidence and leave the
 * country unset; choosing a plausible country would invent a fact.
 */
export function splitInternationalPhone(value: string): SplitInternationalPhoneResult {
  const trimmed = value.trim();
  const compact = trimmed.replaceAll(/[\s().-]/gu, '');

  if (!compact.startsWith('+') || !/^\+\d+$/u.test(compact)) {
    return { countryIso: null, nationalNumber: trimmed };
  }

  const longest = selectLongestDialPrefix(
    [...new Set(COUNTRY_DIAL_CODES.map((country) => country.dial))],
    compact,
  );

  if (longest === undefined) {
    return { countryIso: null, nationalNumber: trimmed };
  }

  const countries = COUNTRY_DIAL_CODES.filter((country) => country.dial === longest);

  if (countries.length !== 1) {
    return { countryIso: null, nationalNumber: trimmed };
  }

  return {
    countryIso: countries.map((country) => country.iso).join(''),
    nationalNumber: compact.slice(longest.length),
  };
}

export function selectLongestDialPrefix(
  dials: readonly string[],
  compactPhone: string,
): string | undefined {
  return dials
    .filter((dial) => compactPhone.startsWith(dial))
    .toSorted((left, right) => right.length - left.length)[0];
}
