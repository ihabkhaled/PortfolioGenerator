export const pageSkeletonClasses = {
  shell: 'mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:px-10',
  header: 'grid max-w-3xl gap-4',
  eyebrow: 'h-3 w-32 animate-pulse rounded-full bg-border motion-reduce:animate-none',
  title: 'h-10 w-full max-w-xl animate-pulse rounded-lg bg-border motion-reduce:animate-none',
  lead: 'h-5 w-full max-w-2xl animate-pulse rounded-md bg-border/80 motion-reduce:animate-none',
  grid: 'grid gap-5 md:grid-cols-2',
  panel:
    'grid min-h-48 animate-pulse gap-4 rounded-lg border border-border bg-surface-raised p-5 motion-reduce:animate-none',
  line: 'h-4 rounded bg-border/80',
  shortLine: 'h-4 w-2/3 rounded bg-border/80',
} as const;
