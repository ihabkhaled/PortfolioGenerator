'use client';
// client-boundary-reason: holds the in-progress draft, the dirty flag and the
// save lifecycle, none of which exist on the server.

import { useCallback, useState, useTransition } from 'react';

import type { PortfolioDocument } from '@/modules/portfolio-document';

import { saveDraftAction } from '../actions/editor.actions';
import { EDITOR_ERROR_KEYS } from '../constants/editor.constants';
import type { DraftEditor, DraftEditorInput } from '../types/draft-editor.types';

/**
 * The editor's state.
 *
 * Explicit save rather than autosave. Both were on the table; explicit wins
 * because this editor has optimistic concurrency, and "your changes could not
 * be saved, someone edited this in another tab" is an answerable message when
 * the user just pressed a button and an infuriating one when it appears on its
 * own three seconds after they stopped typing.
 *
 * The server's version is authoritative. After a successful save the local
 * version is replaced by what came back, so the next save carries the right
 * expectation rather than an incremented guess.
 */
export function useDraftEditor(input: DraftEditorInput): DraftEditor {
  const [document, setDocument] = useState<PortfolioDocument>(input.initialDocument);
  const [version, setVersion] = useState<number>(input.initialVersion);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  const update = useCallback((next: PortfolioDocument): void => {
    setDocument(next);
    setIsDirty(true);
    setError(null);
  }, []);

  const save = useCallback((): void => {
    startSaving(async () => {
      const result = await saveDraftAction({
        portfolioId: input.portfolioId,
        expectedVersion: version,
        document,
      });

      if (result.status === 'error') {
        setError(result.error);

        // A conflict returns the server's current version. Adopting it lets the
        // user reload and retry without the second attempt failing for the same
        // stale-version reason.
        if (result.error === EDITOR_ERROR_KEYS.versionConflict && result.version !== null) {
          setVersion(result.version);
        }

        return;
      }

      if (result.version !== null) {
        setVersion(result.version);
      }

      setIsDirty(false);
      setError(null);
    });
  }, [document, input.portfolioId, version]);

  return { document, version, isDirty, isSaving, error, update, save };
}
