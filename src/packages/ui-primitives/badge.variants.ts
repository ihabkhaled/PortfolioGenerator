import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Technical labels, not decorations. Squared corners and monospace keep them
 * reading as metadata rather than marketing pills.
 */
export const badgeVariants = cva(
  'inline-flex w-fit items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[0.6875rem] font-medium tracking-tight',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-surface text-muted-foreground',
        brand: 'border-primary/25 bg-primary/8 text-primary-readable',
        success: 'border-success/25 bg-success/8 text-success-readable',
        warning: 'border-warning/25 bg-warning/8 text-warning-readable',
        danger: 'border-danger/25 bg-danger/8 text-danger',
        outline: 'border-border bg-transparent text-muted-foreground',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
