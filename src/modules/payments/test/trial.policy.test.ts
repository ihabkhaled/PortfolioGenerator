import { describe, expect, it } from 'vitest';

import { computeTrialEnd, daysRemaining } from '../policies/trial.policy';

describe('computeTrialEnd', () => {
  it('adds exactly 10 days to the start date', () => {
    const started = new Date('2026-08-10T12:00:00.000Z');

    expect(computeTrialEnd(started).toISOString()).toBe('2026-08-20T12:00:00.000Z');
  });
});

describe('daysRemaining', () => {
  const now = new Date('2026-08-10T00:00:00.000Z');

  it.each([
    ['rounds up a partial day so access does not drop early', '2026-08-11T06:00:00.000Z', 2],
    ['returns exactly the whole-day count on an even boundary', '2026-08-13T00:00:00.000Z', 3],
    ['floors at 0 once the trial has ended', '2026-08-09T00:00:00.000Z', 0],
  ])('%s', (_description, endsAtIso, expected) => {
    expect(daysRemaining(new Date(endsAtIso), now)).toBe(expected);
  });

  it('floors at 0 exactly at the trial end instant', () => {
    expect(daysRemaining(now, now)).toBe(0);
  });
});
