import { MS_PER_DAY, TRIAL_DURATION_DAYS } from '../constants/payments.constants';

/** A trial ends exactly `TRIAL_DURATION_DAYS` after it starts, computed once
 * and stored — see the `trialEndsAt` comment in `schema.prisma` for why this
 * is never recomputed from `trialStartedAt` later. */
export function computeTrialEnd(startedAt: Date): Date {
  return new Date(startedAt.getTime() + TRIAL_DURATION_DAYS * MS_PER_DAY);
}

/** Whole days remaining, floored at 0. Rounds up so "ends in a few hours"
 * still reads as "1 day left" rather than "0 days left" while access is
 * still live. */
export function daysRemaining(trialEndsAt: Date, now: Date): number {
  const remainingMs = trialEndsAt.getTime() - now.getTime();

  return remainingMs <= 0 ? 0 : Math.ceil(remainingMs / MS_PER_DAY);
}
