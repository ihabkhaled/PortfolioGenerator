'use client';
// client-boundary-reason: the global boundary replaces the whole document, so
// it renders its own html/body and needs the client reset callback.

import type { ReactElement } from 'react';

import { globalErrorClasses } from './global-error.variants';

/**
 * The last resort: this renders when the root layout itself failed, which
 * means the i18n provider is not mounted. Copy is therefore inlined here — the
 * one sanctioned exception to the message-key rule, because a boundary that
 * throws while rendering its own error message is worse than an untranslated
 * sentence.
 */
export default function GlobalError(props: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}): ReactElement {
  return (
    <html lang="en">
      <body className={globalErrorClasses.body}>
        <main className={globalErrorClasses.panel}>
          <h1 className={globalErrorClasses.title}>Something went wrong</h1>
          <p className={globalErrorClasses.lead}>
            The application could not start. Reloading may resolve it.
          </p>
          <button type="button" className={globalErrorClasses.action} onClick={props.reset}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
