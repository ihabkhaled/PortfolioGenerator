import { sectionClasses } from '@/shared/components/data-display/section.variants';

/**
 * This form only ever renders appended after the `/guides/contact` topic
 * page's own `Section`-driven bands (see the `eyebrow` prop on
 * `ContactFormContainer`), so it needs to read as one more section in that
 * rhythm rather than a bolted-on block — `eyebrow` and `heading` reuse
 * `sectionClasses` tokens directly rather than re-declaring them. `section`
 * isn't `sectionClasses.section` itself: this form is never the first band
 * on the page, so it always wants the divider that `sectionClasses.section`
 * would otherwise suppress via `first:border-t-0`.
 */
export const contactFormClasses = {
  section:
    'mx-auto grid max-w-3xl gap-6 border-t border-border px-5 py-16 sm:px-8 sm:py-20 lg:px-10',
  eyebrow: sectionClasses.eyebrow,
  heading: sectionClasses.title,
  lead: 'max-w-2xl leading-relaxed text-muted-foreground',
  form: 'grid gap-5 rounded-lg border border-border bg-surface-raised p-5 sm:p-7',
  field: 'grid gap-2',
  hidden: 'sr-only',
  actions: 'flex flex-wrap items-center gap-3',
  success: 'text-sm text-success',
  error: 'text-sm text-destructive',
} as const;
