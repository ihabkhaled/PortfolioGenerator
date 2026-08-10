import type { InputHTMLAttributes, ReactElement } from 'react';

import { cn } from './cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * A checkbox or radio is a control, not a text field, and must not carry the
 * text-field chrome below: a `w-full` bordered box around a native checkbox is
 * exactly the oversized, misshapen control this branch exists to prevent.
 * Sizing and accent colour for both come from the global rule in styles.css,
 * which applies once rather than being repeated at every call site.
 */
const nonTextInputTypes = new Set(['checkbox', 'radio']);

export function Input(props: Readonly<InputProps>): ReactElement {
  const { className, type, ...rest } = props;

  if (type !== undefined && nonTextInputTypes.has(type)) {
    return <input type={type} className={cn('align-middle', className)} {...rest} />;
  }

  return (
    <input
      type={type}
      className={cn(
        'h-11 w-full rounded-lg border border-border bg-surface-raised px-3 text-sm text-foreground shadow-xs transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger',
        className,
      )}
      {...rest}
    />
  );
}
