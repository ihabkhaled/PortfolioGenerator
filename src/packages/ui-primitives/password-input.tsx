'use client';
// client-boundary-reason: visibility is local, ephemeral UI state — never
// worth a server round-trip, and irrelevant to anything server-rendered.

import { useState, type ReactElement } from 'react';

import { HidePreviewIcon, PreviewIcon } from '@/packages/icons';

import { cn } from './cn';
import { Input, type InputProps } from './input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Accessible name for the toggle while the password is hidden. */
  readonly showLabel: string;
  /** Accessible name for the toggle while the password is visible. */
  readonly hideLabel: string;
}

/**
 * A password field a person can reveal to check what they typed.
 *
 * The toggle only ever changes `type`; the value itself never leaves this
 * component or gets logged, so revealing it costs nothing a screen-shoulder
 * glance couldn't already see.
 */
export function PasswordInput(props: Readonly<PasswordInputProps>): ReactElement {
  const { className, showLabel, hideLabel, ...rest } = props;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input {...rest} type={visible ? 'text' : 'password'} className={cn('pr-11', className)} />
      <button
        type="button"
        onClick={() => {
          setVisible((current) => !current);
        }}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {visible ? (
          <HidePreviewIcon aria-hidden size={18} />
        ) : (
          <PreviewIcon aria-hidden size={18} />
        )}
      </button>
    </div>
  );
}
