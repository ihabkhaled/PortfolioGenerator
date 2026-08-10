import { describe, expect, it } from 'vitest';

import { COUNTRY_DIAL_CODES } from '@/shared/constants/country-codes.constants';
import {
  countryFlagEmoji,
  findCountryByIso,
  formatPhoneNumber,
  sortCountriesByName,
  selectLongestDialPrefix,
  splitInternationalPhone,
  toTelHref,
} from '@/shared/utils/phone-number.util';

/**
 * A phone number on a portfolio is text a reader copies, not something the
 * product parses. What matters is that the country the person chose stays
 * attached to the number they typed, and that the pair renders unambiguously.
 */

describe('COUNTRY_DIAL_CODES', () => {
  it('covers the complete ISO 3166-1 assigned inventory', () => {
    expect(COUNTRY_DIAL_CODES).toHaveLength(249);
  });
  it('carries a usable dialling prefix for every entry', () => {
    for (const country of COUNTRY_DIAL_CODES) {
      expect(country.dial).toMatch(/^\+\d{1,4}$/u);
      expect(country.iso).toMatch(/^[A-Z]{2}$/u);
      expect(country.name.length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate ISO codes', () => {
    const codes = COUNTRY_DIAL_CODES.map((country) => country.iso);

    expect(new Set(codes).size).toBe(codes.length);
  });

  // `+1` is the whole North American plan and `+7` covers two countries. The
  // ISO code is the key precisely because the prefix cannot be.
  it('allows two countries to share a prefix', () => {
    const plusOne = COUNTRY_DIAL_CODES.filter((country) => country.dial === '+1');

    expect(plusOne.length).toBeGreaterThan(1);
  });
});

describe('splitInternationalPhone', () => {
  it('splits a unique longest evidence-backed prefix', () => {
    expect(splitInternationalPhone('+351 912 345 678')).toEqual({
      countryIso: 'PT',
      nationalNumber: '912345678',
    });
  });

  it('selects the longest matching prefix independent of dataset ordering', () => {
    expect(selectLongestDialPrefix(['+3', '+358', '+35'], '+3581812345')).toBe('+358');
    expect(selectLongestDialPrefix(['+1'], '+99912345')).toBeUndefined();
  });

  it('preserves an unknown international prefix', () => {
    expect(splitInternationalPhone('+99912345')).toEqual({
      countryIso: null,
      nationalNumber: '+99912345',
    });
  });

  it.each(['+1 202 555 0100', '+7 701 123 4567', '+44 20 7946 0958'])(
    'does not guess within a shared calling plan: %s',
    (phone) => {
      expect(splitInternationalPhone(phone)).toEqual({ countryIso: null, nationalNumber: phone });
    },
  );

  it('preserves non-international evidence unchanged', () => {
    expect(splitInternationalPhone('(020) 7946 0958')).toEqual({
      countryIso: null,
      nationalNumber: '(020) 7946 0958',
    });
  });
});

describe('findCountryByIso', () => {
  it('finds a country', () => {
    expect(findCountryByIso('EG')).toEqual({ iso: 'EG', name: 'Egypt', dial: '+20' });
  });

  it.each([
    ['no country chosen', null],
    ['a code that is not a country', 'ZZ'],
  ])('returns nothing for %s', (_label, iso) => {
    expect(findCountryByIso(iso)).toBeNull();
  });
});

describe('countryFlagEmoji', () => {
  it('maps an ISO code to its regional-indicator flag', () => {
    expect(countryFlagEmoji('EG')).toBe('🇪🇬');
    expect(countryFlagEmoji('US')).toBe('🇺🇸');
  });

  it('produces a flag for every entry in the country list', () => {
    // Regional indicators are outside the Basic Multilingual Plane, so each
    // one is a surrogate pair — two UTF-16 units for one code point. Reading
    // by code point index, not by slicing the string, is what makes this
    // check correct rather than merely long enough.
    const REGIONAL_INDICATOR_FIRST = 0x1_f1_e6;
    const REGIONAL_INDICATOR_LAST = 0x1_f1_ff;

    for (const country of COUNTRY_DIAL_CODES) {
      const flag = countryFlagEmoji(country.iso);

      expect(flag).toHaveLength(4);
      expect(flag.codePointAt(0)).toBeGreaterThanOrEqual(REGIONAL_INDICATOR_FIRST);
      expect(flag.codePointAt(0)).toBeLessThanOrEqual(REGIONAL_INDICATOR_LAST);
      expect(flag.codePointAt(2)).toBeGreaterThanOrEqual(REGIONAL_INDICATOR_FIRST);
      expect(flag.codePointAt(2)).toBeLessThanOrEqual(REGIONAL_INDICATOR_LAST);
    }
  });

  it('is case-insensitive', () => {
    expect(countryFlagEmoji('eg')).toBe(countryFlagEmoji('EG'));
  });
});

describe('formatPhoneNumber', () => {
  // Bracketed rather than run together: a bare `+20100...` is trivially misread
  // by one digit, and a reader dialling internationally needs to see where the
  // country code ends.
  it('brackets the prefix and keeps the number as typed', () => {
    expect(formatPhoneNumber('EG', '100-156-8256')).toBe('🇪🇬 (+20) 100-156-8256');
  });

  it('renders the number alone when no country was chosen', () => {
    expect(formatPhoneNumber(null, '100-156-8256')).toBe('100-156-8256');
  });

  it('renders the number alone when the country is unknown to us', () => {
    expect(formatPhoneNumber('ZZ', '100-156-8256')).toBe('100-156-8256');
  });

  it.each([
    ['absent', null],
    ['blank', ' '.repeat(3)],
  ])('renders nothing when the number is %s', (_label, value) => {
    expect(formatPhoneNumber('EG', value)).toBeNull();
  });
});

describe('toTelHref', () => {
  // Punctuation a human reads is noise to a dialler.
  it('strips the punctuation and prepends the prefix', () => {
    expect(toTelHref('EG', '(100) 156-8256')).toBe('tel:+201001568256');
  });

  it('omits the prefix when no country was chosen', () => {
    expect(toTelHref(null, '100 156 8256')).toBe('tel:1001568256');
  });

  it('returns nothing when there is no number', () => {
    expect(toTelHref('EG', null)).toBeNull();
  });
});

describe('sortCountriesByName', () => {
  it('orders by name in the reader locale rather than by file order', () => {
    const sorted = sortCountriesByName('en');
    const names = sorted.map((country) => country.name);

    expect(names).toEqual([...names].toSorted((left, right) => left.localeCompare(right, 'en')));
    expect(sorted).toHaveLength(COUNTRY_DIAL_CODES.length);
  });

  it('does not mutate the stored list', () => {
    const first = COUNTRY_DIAL_CODES[0];

    sortCountriesByName('ar');

    expect(COUNTRY_DIAL_CODES[0]).toBe(first);
  });
});
