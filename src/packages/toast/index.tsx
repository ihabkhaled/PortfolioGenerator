'use client';
// client-boundary-reason: the toast viewport is a portal that owns browser
// state; it cannot render on the server.

import type { ReactElement } from 'react';
import { Toaster, toast } from 'sonner';

/** Owner of `sonner`. */

export function AppToaster(): ReactElement {
  return <Toaster position="bottom-right" closeButton richColors />;
}

export const appToast = {
  success(message: string): void {
    toast.success(message);
  },
  error(message: string): void {
    toast.error(message);
  },
  info(message: string): void {
    toast.info(message);
  },
} as const;
