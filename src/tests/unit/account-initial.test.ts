import { describe, expect, it } from 'vitest';

import { accountInitial } from '@/shared/utils/account-initial.util';

describe('accountInitial', () => {
  it('uses and uppercases the first Unicode grapheme from the visible name', () => {
    expect(accountInitial('  émilie', 'fallback@example.com')).toBe('É');
    expect(accountInitial('👩🏽‍💻 Engineer', 'fallback@example.com')).toBe('👩🏽‍💻');
  });

  it('uses the email when the visible name is blank', () => {
    expect(accountInitial(' '.repeat(3), '  δelta@example.com')).toBe('Δ');
  });

  it('uses a neutral fallback when both identity values are blank', () => {
    expect(accountInitial('  ', '\n\t')).toBe('?');
  });
});
