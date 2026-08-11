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
  PortfolioEditorContainer,
  useDraftEditor,
  EditorDisclosure,
  EditorIssueNavigatorContainer,
} from '@/modules/portfolio-editor/editor-ui';

import { requireElement } from '../fixtures/dom.fixtures';
import {
  buildFullPortfolioDocument,
  buildMinimalPortfolioDocument,
} from '../fixtures/portfolio-document.fixtures';

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
  it('retains safe structured issues from a rejected save and clears them on edit', async () => {
    saveDraftAction.mockResolvedValueOnce({
      status: 'error',
      error: EDITOR_ERROR_KEYS.invalidDocument,
      version: null,
      issues: [{ path: ['identity', 'displayName'], code: 'custom' }],
    });
    const initialDocument = buildFullPortfolioDocument();
    const { result } = renderHook(() =>
      useDraftEditor({ portfolioId: 'portfolio-1', initialDocument, initialVersion: 3 }),
    );

    act(() => {
      result.current.save();
    });
    await waitFor(() => {
      expect(result.current.issues).toHaveLength(1);
    });
    expect(result.current.issues[0]).toEqual({
      path: ['identity', 'displayName'],
      code: 'custom',
    });

    act(() => {
      result.current.update({ ...initialDocument, interests: ['Architecture'] });
    });
    expect(result.current.issues).toEqual([]);
  });
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

describe('editor disclosures', () => {
  it('uses a keyboard-operable native disclosure with a stable ancestor id', async () => {
    render(
      <EditorDisclosure id="editor-projects" title="Projects" summary="2 entries">
        <p>Project controls</p>
      </EditorDisclosure>,
    );

    const summary = screen.getByText('Projects');
    expect(screen.queryByText('Project controls')).not.toBeVisible();
    await userEvent.click(summary);
    expect(screen.getByText('Project controls')).toBeVisible();
  });
});

describe('editor issue navigation', () => {
  it('switches mobile preview back to edit before focusing a rejected field', async () => {
    const user = userEvent.setup();
    saveDraftAction.mockResolvedValueOnce({
      status: 'error',
      error: null,
      version: null,
      issues: [{ path: ['identity', 'displayName'], code: 'custom' }],
    });
    render(
      <PortfolioEditorContainer
        portfolioId="portfolio-1"
        initialDocument={buildMinimalPortfolioDocument()}
        initialVersion={3}
        warnings={[]}
        uploadAssetAction={leaveUploadIdle}
        labels={{
          identityTitle: 'Identity',
          identityHint: 'Identity hint',
          displayName: 'Display name',
          headline: 'Headline',
          summary: 'Summary',
          location: 'Location',
          nationality: 'Nationality',
          militaryStatus: 'Military status',
          tagline: 'Tagline',
          availabilityEnabled: 'Available',
          availabilityNote: 'Availability note',
          coverLetter: 'Cover letter',
          contactTitle: 'Contact',
          contactHint: 'Contact hint',
          email: 'Email',
          phone: 'Phone',
          phoneCountry: 'Country',
          phoneCountryNone: 'None',
          showPublicly: 'Show publicly',
          seoTitle: 'SEO',
          seoHint: 'SEO hint',
          seoTitleField: 'SEO title',
          seoDescriptionField: 'SEO description',
          indexable: 'Indexable',
          save: 'Save',
          saving: 'Saving',
          saved: 'Saved',
          unsaved: 'Unsaved',
          warningsTitle: 'Warnings',
          required: 'Required',
        }}
      />,
    );
    const name = screen.getByLabelText(/Display name/u);
    await user.clear(name);
    await user.click(screen.getByRole('button', { name: 'Preview' }));
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await screen.findByRole('button', { name: 'Next issue' });
    await user.click(screen.getByRole('button', { name: 'Next issue' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit' })).toHaveAttribute('aria-pressed', 'true');
      expect(name).toHaveFocus();
    });
  }, 15_000);
  it('opens ancestors, highlights and focuses the exact control, and cycles issues', async () => {
    render(
      <>
        <details id="editor-identity">
          <summary>Identity</summary>
          <input id="identity-display-name" />
        </details>
        <input id="seo-title" />
        <EditorIssueNavigatorContainer
          targets={[
            { controlId: 'identity-display-name', disclosureIds: ['editor-identity'] },
            { controlId: 'seo-title', disclosureIds: [] },
          ]}
          countLabel="2 issues"
          previousLabel="Previous issue"
          nextLabel="Next issue"
          message="Check this field"
          generalIssues={[]}
          generalTitle="General issues"
        />
      </>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Next issue' }));
    const [identityControl, seoControl] = screen.getAllByRole('textbox');
    expect(identityControl).toBeVisible();
    expect(identityControl).toHaveAttribute('aria-invalid', 'true');
    expect(identityControl).toHaveFocus();

    await userEvent.click(screen.getByRole('button', { name: 'Next issue' }));
    await waitFor(() => {
      expect(seoControl).toHaveFocus();
    });
    await userEvent.click(screen.getByRole('button', { name: 'Previous issue' }));
    await waitFor(() => {
      expect(identityControl).toHaveFocus();
    });
  });

  it('lists unmapped issues without adding them to the navigable cycle and cleans stale state', async () => {
    const { rerender } = render(
      <>
        <input id="seo-title" />
        <EditorIssueNavigatorContainer
          targets={[{ controlId: 'seo-title', disclosureIds: [] }]}
          countLabel="2 issues"
          previousLabel="Previous issue"
          nextLabel="Next issue"
          message="Check this field"
          generalIssues={[{ path: [], code: 'custom' }]}
          generalTitle="General issues"
        />
      </>,
    );
    expect(screen.getByRole('heading', { name: 'General issues' })).toBeInTheDocument();
    expect(screen.getByText(/^General issues · [0-9A-F]{8}$/u)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Next issue' }));
    const highlighted = screen.getByRole('textbox');
    expect(highlighted).toHaveAttribute('aria-invalid', 'true');

    rerender(
      <EditorIssueNavigatorContainer
        targets={[]}
        countLabel="0 issues"
        previousLabel="Previous issue"
        nextLabel="Next issue"
        message="Check this field"
        generalIssues={[]}
        generalTitle="General issues"
      />,
    );
    expect(highlighted).not.toHaveAttribute('aria-invalid');
  });
});

describe('page manager controls', () => {
  it('announces required page fields and keeps descriptions optional', () => {
    render(
      <PageManagerContainer
        portfolioId="portfolio-1"
        expectedVersion={1}
        document={buildFullPortfolioDocument()}
        onChange={vi.fn()}
        onVersionChange={vi.fn()}
      />,
    );
    expect(screen.getAllByLabelText(/Page title/u)[0]).toBeRequired();
    expect(screen.getAllByLabelText(/Navigation label/u)[0]).toBeRequired();
    expect(screen.getAllByLabelText(/Address/u)[0]).toBeRequired();
    expect(screen.getAllByText('(Required)')[0]).toHaveClass('sr-only');
    expect(screen.getAllByLabelText('Page description')[0]).not.toBeRequired();
  });
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

    await userEvent.type(requireElement(screen.getAllByLabelText(/Page title/u)[0]), 'Speaking');
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
    const projectTitle = within(projectEntry).getByLabelText(/Page title/u);
    await userEvent.clear(projectTitle);
    await userEvent.type(projectTitle, 'Work');
    const navigationLabel = within(projectEntry).getByLabelText(/Navigation label/u);
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
  it('collapses each collection and entry behind stable, meaningful summaries', () => {
    const documentValue = buildFullPortfolioDocument();
    render(<CollectionManagerContainer document={documentValue} onChange={vi.fn()} />);

    expect(screen.getByText('Projects')).toBeVisible();
    expect(screen.getByText('Ledger Replay')).not.toBeVisible();
  });
  it('marks only canonical required collection controls as required', () => {
    const documentValue = buildFullPortfolioDocument();
    render(
      <CollectionEntryContainer
        document={documentValue}
        onChange={vi.fn()}
        collectionKey="experience"
        item={requireElement(documentValue.experience[0])}
        index={0}
      />,
    );

    expect(screen.getByRole('textbox', { name: /Organization.*Required/u })).toBeRequired();
    expect(screen.getByRole('textbox', { name: /Title.*Required/u })).toBeRequired();
    expect(screen.getByLabelText('Location')).not.toBeRequired();
    expect(screen.getByLabelText('Start month')).not.toBeRequired();
  });
  it('updates interests and adds a blank owner-controlled entry', async () => {
    const user = userEvent.setup();
    const documentValue = buildMinimalPortfolioDocument();
    const onChange = vi.fn<(value: PortfolioDocument) => void>();
    render(<CollectionManagerContainer document={documentValue} onChange={onChange} />);

    const interests = screen.getByLabelText('Interests, separated by commas');
    await user.click(interests);
    await user.paste('Databases, Accessibility');
    await user.click(requireElement(screen.getAllByRole('button', { name: 'Add entry' })[0]));

    expect(
      onChange.mock.calls.some(
        ([value]) => value.interests.join(', ') === 'Databases, Accessibility',
      ),
    ).toBe(true);
    expect(
      onChange.mock.calls.some(
        ([value]) => value.experience.length === documentValue.experience.length + 1,
      ),
    ).toBe(true);
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
    await userEvent.clear(screen.getByLabelText(/Name/));
    await userEvent.type(screen.getByLabelText(/Name/), 'Owner project');
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

    await userEvent.selectOptions(screen.getByLabelText(/Skill level/), 'strong');

    expect(onChange).toHaveBeenCalledWith({
      ...documentValue,
      skills: documentValue.skills.map((skill, index) =>
        index === 0 ? { ...skill, tier: 'strong' } : skill,
      ),
    });
  });
});

describe('asset controls', () => {
  it('marks upload files and owner-written public labels as required', () => {
    const documentValue = buildFullPortfolioDocument();
    render(
      <AssetCollectionsUploadContainer
        portfolioId="portfolio-1"
        gallery={documentValue.gallery}
        attachments={documentValue.attachments}
        pages={documentValue.pages}
        uploadAction={leaveUploadIdle}
        onGalleryUploaded={vi.fn()}
        onAttachmentUploaded={vi.fn()}
        onGalleryRemove={vi.fn()}
        onAttachmentRemove={vi.fn()}
        onPlacementChange={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/Gallery image.*Required/)).toBeRequired();
    expect(screen.getByLabelText(/Image description/u)).toBeRequired();
    expect(screen.getByLabelText(/Downloadable file.*Required/u)).toBeRequired();
    expect(screen.getByLabelText(/File type/u)).toBeRequired();
    expect(screen.getByLabelText(/Public download label/u)).toBeRequired();
    expect(screen.getByLabelText('Caption (optional)')).not.toBeRequired();
  });
  it('retains gallery and attachment metadata and wires both removal controls', async () => {
    const documentValue = buildFullPortfolioDocument();
    const onGalleryRemove = vi.fn();
    const onAttachmentRemove = vi.fn();
    const onPlacementChange = vi.fn();
    render(
      <AssetCollectionsUploadContainer
        portfolioId="portfolio-1"
        gallery={documentValue.gallery}
        attachments={documentValue.attachments}
        pages={documentValue.pages}
        uploadAction={leaveUploadIdle}
        onGalleryUploaded={vi.fn()}
        onAttachmentUploaded={vi.fn()}
        onGalleryRemove={onGalleryRemove}
        onAttachmentRemove={onAttachmentRemove}
        onPlacementChange={onPlacementChange}
      />,
    );

    await userEvent.type(
      screen.getByLabelText(/Image description/u),
      'Owner on a conference stage',
    );
    await userEvent.type(screen.getByLabelText('Caption (optional)'), 'Cairo, 2026');
    await userEvent.selectOptions(screen.getByLabelText(/File type/u), 'other');
    await userEvent.type(screen.getByLabelText(/Public download label/u), 'Conference slides');
    const draftRemovalButtons = screen.getAllByRole('button', { name: 'Remove from draft' });
    await userEvent.click(requireElement(draftRemovalButtons[0]));
    await userEvent.click(requireElement(draftRemovalButtons.at(-1)));
    await userEvent.click(screen.getByLabelText('Downloadable file: Projects'));

    expect(onGalleryRemove).toHaveBeenCalledWith(0);
    expect(onAttachmentRemove).toHaveBeenCalledWith(0);
    expect(onPlacementChange).toHaveBeenCalledWith('attachments', 'page-projects', true);
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
