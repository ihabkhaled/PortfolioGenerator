export const accountClasses = {
  page: 'mx-auto grid w-full max-w-3xl gap-5 px-5 py-10 sm:gap-6 sm:px-8',
  header: 'grid gap-2 pb-1',
  title: 'font-display text-2xl font-bold tracking-tight text-foreground',
  lead: 'text-sm text-muted-foreground',
  section: 'grid gap-4 rounded-xl border border-border bg-surface-raised p-5',
  dangerSection: 'grid gap-4 rounded-xl border border-danger/40 bg-surface-raised p-5',
  disclosure:
    'group overflow-hidden rounded-xl border border-border bg-surface-raised transition-shadow open:shadow-sm',
  dangerDisclosure:
    'group overflow-hidden rounded-xl border border-danger/40 bg-surface-raised transition-shadow open:shadow-sm',
  disclosureSummary:
    'flex min-h-16 cursor-pointer list-none items-start justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden',
  disclosureCopy: 'grid min-w-0 gap-1',
  disclosureTitle: 'font-display text-base font-semibold text-foreground',
  disclosureHint: 'text-sm leading-relaxed text-muted-foreground',
  disclosureIcon:
    'mt-0.5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none',
  disclosureBody:
    'grid gap-4 border-t border-border px-5 py-5 [&>form]:rounded-none [&>form]:border-0 [&>form]:bg-transparent [&>form]:p-0 [&>form>h2:first-child]:hidden [&>form>p:nth-child(2)]:hidden [&>section]:rounded-none [&>section]:border-0 [&>section]:bg-transparent [&>section]:p-0 [&>section>h2:first-child]:hidden [&>section>p:nth-child(2)]:hidden',
  embedded: 'grid gap-4',
  sectionTitle: 'font-display text-base font-semibold text-foreground',
  // One step down from `sectionTitle`, matching the editor module's
  // `entryTitle` convention: a subsection nested inside a card reads as a
  // heading, not as another card of the same weight.
  subsectionTitle: 'text-sm font-medium text-foreground',
  sectionHint: 'text-sm text-muted-foreground',
  field: 'grid gap-1.5',
  row: 'flex flex-wrap items-end gap-3',
  definitionList: 'grid gap-2 text-sm',
  definitionRow: 'flex flex-wrap items-baseline justify-between gap-3',
  definitionTerm: 'text-muted-foreground',
  definitionValue: 'font-medium text-foreground',
  error: 'flex items-start gap-2 text-sm text-danger',
  errorText: 'min-w-0',
} as const;
