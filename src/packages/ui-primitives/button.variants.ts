import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Restrained, precise controls. No lift-on-hover and no coloured shadows — the
 * feedback is a small, confident change in surface and border.
 */
export const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-sm font-medium transition-[color,background-color,border-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none',
  {
    variants: {
      variant: {
        primary:
          'bg-foreground text-canvas shadow-sm hover:bg-foreground/88 active:bg-foreground/95',
        secondary:
          'border border-border bg-surface-raised text-foreground shadow-xs hover:border-border-strong hover:bg-muted active:bg-border/40',
        soft: 'bg-muted text-foreground hover:bg-border',
        danger: 'bg-danger text-danger-foreground shadow-sm hover:bg-danger/90 active:bg-danger',
        ghost: 'text-muted-foreground hover:bg-muted hover:text-foreground active:bg-border/50',
      },
      size: {
        sm: 'h-9 gap-1.5 px-3.5 text-[0.8125rem]',
        md: 'h-11 px-5',
        lg: 'h-12 px-6 text-[0.9375rem]',
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
