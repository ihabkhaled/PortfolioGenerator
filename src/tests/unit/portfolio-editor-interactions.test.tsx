import { act, render, renderHook, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PortfolioDocument } from '@/modules/portfolio-document';
import {
  EDITOR_ERROR_KEYS,
  type EditorActionState,
  type SaveDraftPayload,
} from '@/modules/portfolio-editor';
import {
  AssetCollectionsUploadContainer,
  CollectionEntryContainer,
  CollectionManagerContainer,
  PageManagerContainer,
  PortraitUploadContainer,
  useDraftEditor,
} from '@/modules/portfolio-editor/editor-ui';

import { requireElement } from '../fixtures/dom.fixtures';
import { buildFullPortfolioDocument } from '../fixtures/portfolio-document.fixtures';

const { saveDraftAction } = vi.hoisted(() => ({
  saveDraftAction: vi.fn<(payload: SaveDraftPayload) => Promise<EditorActionState>>(),
}));

vi.mock('@/modules/portfolio-editor/actions/editor.actions', () => ({
  saveDraftAction,
}));

beforeEach(() => {
  saveDraftAction.mockReset();
});

function leaveUploadIdle(): Promise<{ readonly status: 'idle' }> {
  return Promise.resolve({ status: 'idle' });
}

describe('draft editor save lifecycle', () => {
  it('adopts an explicit version and clears an earlier error when the owner edits again', async () => {
    saveDraftAction.mockResolvedValueOnce({
      status: 'error',
      error: EDITOR_ERROR_KEYS.notFound,
      version: null,
    });
    const initialDocument = buildFullPortfolioDocument();
    const { result } = renderHook(() =>
      useDraftEditor({ portfolioId: 'portfolio-1', initialDocument, initialVersion: 3 }),
    );

    act(() => {
      result.current.save();
    });
    await waitFor(() => {
      expect(result.current.error).toBe(EDITOR_ERROR_KEYS.notFound);
    });
    act(() => {
      result.current.adoptVersion(8);
    });
    act(() => {
      result.current.update({ ...initialDocument, interests: ['Architecture'] });
    });

    expect(result.current.version).toBe(8);
    expect(result.current.error).toBeNull();
    expect(result.current.isDirty).toBe(true);
  });

  it('uses the authoritative saved version and marks the draft clean', async () => {
    saveDraftAction.mockResolvedValueOnce({ status: 'saved', error: null, version: 12 });
    const initialDocument = buildFullPortfolioDocument();
    const { result } = renderHook(() =>
      useDraftEditor({ portfolioId: 'portfolio-1', initialDocument, initialVersion: 3 }),
    );
    const edited = { ...initialDocument, interests: ['Distributed systems'] };

    act(() => {
      result.current.update(edited);
    });
    act(() => {
      result.current.save();
    });

    await waitFor(() => {
      expect(result.current.isDirty).toBe(false);
    });
    expect(result.current.version).toBe(12);
    expect(saveDraftAction).toHaveBeenCalledWith({
      portfolioId: 'portfolio-1',
      expectedVersion: 3,
      document: edited,
    });
  });

  it('keeps the current version when a successful save has no replacement version', async () => {
    saveDraftAction.mockResolvedValueOnce({ status: 'saved', error: null, version: null });
    const initialDocument = buildFullPortfolioDocument();
    const { result } = renderHook(() =>
      useDraftEditor({ portfolioId: 'portfolio-1', initialDocument, initialVersion: 3 }),
    );

    act(() => {
      result.current.update({ ...initialDocument, interests: ['Reliability'] });
    });
    act(() => {
      result.current.save();
    });

    await waitFor(() => {
      expect(result.current.isDirty).toBe(false);
    });
    expect(result.current.version).toBe(3);
  });

  it('adopts the server version after a conflict but retains unsaved edits', async () => {
    saveDraftAction.mockResolvedValueOnce({
      status: 'error',
      error: EDITOR_ERROR_KEYS.versionConflict,
      version: 17,
    });
    const initialDocument = buildFullPortfolioDocument();
    const { result } = renderHook(() =>
      useDraftEditor({ portfolioId: 'portfolio-1', initialDocument, initialVersion: 3 }),
    );

    act(() => {
      result.current.update({ ...initialDocument, interests: ['Databases'] });
    });
    act(() => {
      result.current.save();
    });

    await waitFor(() => {
      expect(result.current.version).toBe(17);
    });
    expect(result.current.error).toBe(EDITOR_ERROR_KEYS.versionConflict);
    expect(result.current.isDirty).toBe(true);
  });
});

describe('page manager controls', () => {
  it('does not create a page until all three owner-written fields are present', async () => {
    const onChange = vi.fn<(value: PortfolioDocument) => void>();
    render(
      <PageManagerContainer
        portfolioId="portfolio-1"
        expectedVersion={1}
        document={buildFullPortfolioDocument()}
        onChange={onChange}
        onVersionChange={vi.fn()}
      />,
    );

    await userEvent.type(requireElement(screen.getAllByLabelText('Page title')[0]), 'Speaking');
    await userEvent.click(screen.getByRole('button', { name: 'Add page' }));

    expect(onChange).not.toHaveBeenCalled();
  });

  it('wires page metadata, ordering, visibility, and removal to the draft', async () => {
    const documentValue = buildFullPortfolioDocument();
    const onChange = vi.fn<(value: PortfolioDocument) => void>();
    render(
      <PageManagerContainer
        portfolioId="portfolio-1"
        expectedVersion={1}
        document={documentValue}
        onChange={onChange}
        onVersionChange={vi.fn()}
      />,
    );

    const projectEntry = requireElement(
      screen
        .getAllByRole('listitem')
        .find((entry) => within(entry).queryByDisplayValue('projects') !== null),
    );
    const projectAddress = within(projectEntry).getByDisplayValue('projects');
    const projectTitle = within(projectEntry).getByLabelText('Page title');
    await userEvent.clear(projectTitle);
    await userEvent.type(projectTitle, 'Work');
    const navigationLabel = within(projectEntry).getByLabelText('Navigation label');
    await userEvent.clear(navigationLabel);
    await userEvent.type(navigationLabel, 'Work');
    await userEvent.clear(projectAddress);
    await userEvent.type(projectAddress, 'work');
    await userEvent.type(within(projectEntry).getByLabelText('Page description'), ' '.repeat(3));
    await userEvent.click(within(projectEntry).getByRole('button', { name: 'Move page up' }));
    await userEvent.click(within(projectEntry).getByRole('button', { name: 'Hide' }));
    await userEvent.click(within(projectEntry).getByRole('button', { name: 'Remove page' }));

    expect(
      onChange.mock.calls.some(
        ([value]) => value.pages[1]?.title !== documentValue.pages[1]?.title,
      ),
    ).toBe(true);
    expect(
      onChange.mock.calls.some(
        ([value]) => value.pages[1]?.navLabel !== documentValue.pages[1]?.navLabel,
      ),
    ).toBe(true);
    expect(
      onChange.mock.calls.some(([value]) => value.pages[1]?.slug !== documentValue.pages[1]?.slug),
    ).toBe(true);
    expect(onChange.mock.calls.some(([value]) => value.pages[1]?.description === null)).toBe(true);
    expect(onChange.mock.calls.some(([value]) => value.pages[0]?.id === 'page-projects')).toBe(
      true,
    );
    expect(onChange.mock.calls.some(([value]) => value.pages[1]?.visible === false)).toBe(true);
    expect(onChange.mock.calls.some(([value]) => value.pages.length === 2)).toBe(true);
  });
});

describe('collection controls', () => {
  it('updates interests and adds a blank owner-controlled entry', async () => {
    const onChange = vi.fn<(value: PortfolioDocument) => void>();
    render(
      <CollectionManagerContainer document={buildFullPortfolioDocument()} onChange={onChange} />,
    );

    await userEvent.clear(screen.getByLabelText('Interests, separated by commas'));
    await userEvent.type(
      screen.getByLabelText('Interests, separated by commas'),
      'Databases, Accessibility',
    );
    await userEvent.click(requireElement(screen.getAllByRole('button', { name: 'Add entry' })[0]));

    expect(onChange.mock.calls.some(([value]) => value.interests.length !== 1)).toBe(true);
    expect(onChange.mock.calls.some(([value]) => value.experience.length === 3)).toBe(true);
  });

  it('wires boolean, select, multiline, move, and remove controls for an entry', async () => {
    const documentValue = buildFullPortfolioDocument();
    const onChange = vi.fn<(value: PortfolioDocument) => void>();
    render(
      <CollectionEntryContainer
        document={documentValue}
        onChange={onChange}
        collectionKey="projects"
        item={requireElement(documentValue.projects[0])}
        index={0}
      />,
    );

    await userEvent.click(screen.getByLabelText('Featured project'));
    await userEvent.clear(screen.getByLabelText('Project paragraphs, one per line'));
    await userEvent.type(
      screen.getByLabelText('Project paragraphs, one per line'),
      'First paragraph{enter}{enter}Second paragraph',
    );
    await userEvent.clear(screen.getByLabelText('Name'));
    await userEvent.type(screen.getByLabelText('Name'), 'Owner project');
    await userEvent.click(screen.getByRole('button', { name: 'Move entry down' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove entry' }));

    expect(onChange.mock.calls.some(([value]) => value.projects[0]?.featured === false)).toBe(true);
    expect(
      onChange.mock.calls.some(
        ([value]) =>
          value.projects[0]?.content.length !== documentValue.projects[0]?.content.length,
      ),
    ).toBe(true);
    expect(
      onChange.mock.calls.some(
        ([value]) => value.projects[0]?.name !== documentValue.projects[0]?.name,
      ),
    ).toBe(true);
    expect(
      onChange.mock.calls.some(
        ([value]) => value.projects[1]?.id === documentValue.projects[0]?.id,
      ),
    ).toBe(true);
    expect(onChange.mock.calls.some(([value]) => value.projects.length === 1)).toBe(true);
  });

  it('wires the skill tier select to the owning collection', async () => {
    const documentValue = buildFullPortfolioDocument();
    const onChange = vi.fn();
    render(
      <CollectionEntryContainer
        document={documentValue}
        onChange={onChange}
        collectionKey="skills"
        item={requireElement(documentValue.skills[0])}
        index={0}
      />,
    );

    await userEvent.selectOptions(screen.getByLabelText('Skill level'), 'strong');

    expect(onChange).toHaveBeenCalledWith({
      ...documentValue,
      skills: documentValue.skills.map((skill, index) =>
        index === 0 ? { ...skill, tier: 'strong' } : skill,
      ),
    });
  });
});

describe('asset controls', () => {
  it('retains gallery and attachment metadata and wires both removal controls', async () => {
    const documentValue = buildFullPortfolioDocument();
    const onGalleryRemove = vi.fn();
    const onAttachmentRemove = vi.fn();
    render(
      <AssetCollectionsUploadContainer
        portfolioId="portfolio-1"
        gallery={documentValue.gallery}
        attachments={documentValue.attachments}
        uploadAction={leaveUploadIdle}
        onGalleryUploaded={vi.fn()}
        onAttachmentUploaded={vi.fn()}
        onGalleryRemove={onGalleryRemove}
        onAttachmentRemove={onAttachmentRemove}
      />,
    );

    await userEvent.type(screen.getByLabelText('Image description'), 'Owner on a conference stage');
    await userEvent.type(screen.getByLabelText('Caption (optional)'), 'Cairo, 2026');
    await userEvent.selectOptions(screen.getByLabelText('File type'), 'other');
    await userEvent.type(screen.getByLabelText('Public download label'), 'Conference slides');
    const draftRemovalButtons = screen.getAllByRole('button', { name: 'Remove from draft' });
    await userEvent.click(requireElement(draftRemovalButtons[0]));
    await userEvent.click(requireElement(draftRemovalButtons.at(-1)));

    expect(onGalleryRemove).toHaveBeenCalledWith(0);
    expect(onAttachmentRemove).toHaveBeenCalledWith(0);
  });

  it('removes an existing portrait only through its explicit control', async () => {
    const onRemove = vi.fn();
    render(
      <PortraitUploadContainer
        portfolioId="portfolio-1"
        hasPortrait
        uploadAction={leaveUploadIdle}
        onUploaded={vi.fn()}
        onRemove={onRemove}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Remove portrait' }));

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
