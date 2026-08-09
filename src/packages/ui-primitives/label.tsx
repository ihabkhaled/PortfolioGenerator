import type { LabelHTMLAttributes, ReactElement } from 'react';

import { cn } from './cn';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label(props: Readonly<LabelProps>): ReactElement {
  const { className, children, ...rest } = props;

  return (
    <label
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground',
        className,
      )}
      {...rest}
    >
      {children}
    </label>
  );
}
