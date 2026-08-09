export const PRIVATE_PAGE_ACCESS_ENDPOINT = '/api/private-page-access';

export const PRIVATE_PAGE_FIELD_NAMES = {
  portfolioSlug: 'portfolioSlug',
  pageSlug: 'pageSlug',
  password: 'password',
  locale: 'locale',
} as const;

export const privatePageChallengeClasses = {
  page: 'mx-auto grid min-h-[70vh] w-full max-w-lg place-items-center px-5 py-16',
  card: 'w-full',
  form: 'grid gap-5',
  field: 'grid gap-2',
  error: 'rounded-md border border-danger/40 bg-danger/8 px-3 py-2.5 text-sm text-danger',
  submit: 'w-full cursor-pointer',
} as const;
