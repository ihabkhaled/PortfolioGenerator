import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Restrained, precise controls. No lift-on-hover and no coloured shadows — the
 * feedback is a small, confident change in surface and border.
 */
export const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition-[color,background-color,border-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-foreground text-canvas hover:bg-foreground/88',
        secondary:
          'border border-border bg-surface-raised text-foreground hover:border-border-strong hover:bg-muted',
        soft: 'bg-muted text-foreground hover:bg-border',
        danger: 'bg-danger text-danger-foreground hover:bg-danger/90',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground',
      },
      size: {
        sm: 'h-9 px-3.5',
        md: 'h-11 px-5',
        lg: 'h-12 px-6',
        icon: 'size-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
