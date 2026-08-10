'use client';
// client-boundary-reason: bridges live draft state between two sibling client
// components that do not otherwise share a parent with state.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

/**
 * Lets the publish panel see whether the draft it is about to publish is the
 * one on screen.
 *
 * The editor and the publish panel are deliberate siblings, not parent and
 * child — see `page.tsx` — because publishing reads the persisted draft, not
 * whatever is currently typed. That split has a sharp edge: a user who types
 * a headline and clicks Publish without clicking Save first gets blocked by
 * requirements they believe they already met, because the server checked the
 * save before theirs. This context is how the publish panel learns there is
 * an unsaved change to warn about, without the two components becoming one.
 */
export interface DraftStatus {
  readonly isDirty: boolean;
  readonly isSaving: boolean;
  readonly save: () => void;
}

interface DraftStatusContextValue {
  readonly status: DraftStatus;
  readonly setStatus: (status: DraftStatus) => void;
}

const NOOP_STATUS: DraftStatus = {
  isDirty: false,
  isSaving: false,
  save: () => {
    // No provider is mounted; there is no draft to save.
  },
};

const DraftStatusContext = createContext<DraftStatusContextValue | null>(null);

export function DraftStatusProvider(props: Readonly<{ children: ReactNode }>): ReactElement {
  const [status, setStatus] = useState<DraftStatus>(NOOP_STATUS);

  return (
    <DraftStatusContext.Provider value={{ status, setStatus }}>
      {props.children}
    </DraftStatusContext.Provider>
  );
}

/** The editor calls this to keep the shared status current as the draft changes. */
export function useDraftStatusPublisher(status: DraftStatus): void {
  const context = useContext(DraftStatusContext);
  const setStatus = context?.setStatus;
  // Destructured to plain values so the effect's dependency list is exact.
  // `save` is *not* stable — useDraftEditor rebuilds it on every document
  // change — which is exactly why it belongs in the list: the publish panel
  // has to call the `save` that closes over the current draft, not a stale
  // one from the render this effect first ran in.
  const { isDirty, isSaving, save } = status;

  useEffect(() => {
    setStatus?.({ isDirty, isSaving, save });
  }, [setStatus, isDirty, isSaving, save]);
}

/** Any sibling — the publish panel — reads the current status with this. */
export function useDraftStatus(): DraftStatus {
  const context = useContext(DraftStatusContext);

  return context?.status ?? NOOP_STATUS;
}

/** Test-only: a value to render inside a provider without the real editor. */
export function useSetDraftStatus(): (status: DraftStatus) => void {
  const context = useContext(DraftStatusContext);
  const setStatus = context?.setStatus;

  return useCallback(
    (status: DraftStatus) => {
      setStatus?.(status);
    },
    [setStatus],
  );
}
