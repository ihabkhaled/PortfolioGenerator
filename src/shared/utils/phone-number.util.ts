import { COUNTRY_DIAL_CODES } from '@/shared/constants/country-codes.constants';
import type { CountryDialCode } from '@/shared/types/country-code.types';

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
 * `(+20) 100-156-8256`.
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

  return country === null ? trimmed : `(${country.dial}) ${trimmed}`;
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
