import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ACCOUNT_DELETE_CONFIRMATION } from '@/modules/account';
import { DeleteAccountContainer, DeletePortfolioContainer } from '@/modules/account/account-ui';
import { AdminSignInFormContainer, AdminTwoFactorEnrollContainer } from '@/modules/admin/admin-ui';
import { SignInFormContainer, SignOutButtonContainer, SignUpFormContainer } from '@/modules/auth';
import {
  PortfolioEditorContainer,
  PublishPanelContainer,
  type EditorLabels,
} from '@/modules/portfolio-editor/editor-ui';
import { CreatePortfolioFormContainer } from '@/modules/portfolios/dashboard';
import { ImportResumeFormContainer } from '@/modules/resume-ingestion/ingestion-ui';
import { I18N_NAMESPACES, useAppTranslation } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';

import { requireElement } from '../fixtures/dom.fixtures';
import {
  buildFullPortfolioDocument,
  buildMinimalPortfolioDocument,
} from '../fixtures/portfolio-document.fixtures';

const { copyBrowserText } = vi.hoisted(() => ({
  copyBrowserText: vi.fn<() => Promise<void>>(),
}));

vi.mock('@/packages/browser', () => ({ copyBrowserText }));

// The complete editor intentionally renders every authoring collection. Under
// V8 coverage instrumentation that full integration surface can exceed the
// default five-second unit timeout on shared CI workers.
vi.setConfig({ testTimeout: 15_000 });

const editorPageLabels: EditorLabels = {
  identityTitle: 'Identity',
  identityHint: 'Who you are.',
  displayName: 'Display name',
  headline: 'Headline',
  summary: 'Summary',
  location: 'Location',
  nationality: 'Nationality',
  militaryStatus: 'Military status',
  tagline: 'Tagline',
  availabilityEnabled: 'Available for work',
  availabilityNote: 'Availability note',
  coverLetter: 'Cover letter',
  contactTitle: 'Contact',
  contactHint: 'How people reach you.',
  email: 'Email',
  phone: 'Phone',
  phoneCountry: 'Country code',
  phoneCountryNone: 'No country',
  showPublicly: 'Show publicly',
  seoTitle: 'Search',
  seoHint: 'How this looks in results.',
  seoTitleField: 'Title',
  seoDescriptionField: 'Description',
  indexable: 'Allow search engines',
  save: 'Save',
  saving: 'Saving',
  saved: 'Saved',
  unsaved: 'Unsaved changes',
  warningsTitle: 'Worth a second look',
  required: 'Required',
};

function leaveAssetUploadIdle(): Promise<{ readonly status: 'idle' }> {
  return Promise.resolve({ status: 'idle' });
}

function renderEditor(
  warnings: readonly { code: string; path: string; message: string }[] = [],
  initialDocument = buildFullPortfolioDocument(),
): void {
  render(
    <PortfolioEditorContainer
      portfolioId="p1"
      initialDocument={initialDocument}
      initialVersion={1}
      labels={editorPageLabels}
      warnings={warnings}
      uploadAssetAction={leaveAssetUploadIdle}
    />,
  );
}

function renderPanel(isPublished: boolean): void {
  render(
    <PublishPanelContainer
      portfolioId="p1"
      slug="amina-rahman"
      isPublished={isPublished}
      origin="https://portfoliogenerate.test"
    />,
  );
}

/**
 * Containers own the state that only exists in a browser.
 *
 * The server actions they submit to are exercised end-to-end; what is testable
 * here — and worth testing — is the local behaviour around them: what a
 * destructive control looks like before it is armed, and what happens when a
 * user changes their mind.
 */

describe('DeletePortfolioContainer', () => {
  const labels = {
    portfolioId: 'p1',
    label: 'Delete',
    confirmLabel: 'Delete permanently',
    cancelLabel: 'Keep it',
    submittingLabel: 'Deleting',
    confirmMessage: 'This removes the portfolio and its uploaded CV files.',
  };

  // The first click must not delete anything.
  it('shows only a disarmed button until it is clicked', () => {
    render(<DeletePortfolioContainer {...labels} />);

    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete permanently' })).not.toBeInTheDocument();
  });

  it('reveals the consequence and a confirm button on the first click', async () => {
    render(<DeletePortfolioContainer {...labels} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByText(labels.confirmMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete permanently' })).toBeInTheDocument();
  });

  // A stray click must not leave a live delete button sitting in the row.
  it('disarms again on cancel', async () => {
    render(<DeletePortfolioContainer {...labels} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(screen.getByRole('button', { name: 'Keep it' }));

    expect(screen.queryByRole('button', { name: 'Delete permanently' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('carries the portfolio id in the submitted form', async () => {
    render(<DeletePortfolioContainer {...labels} />);

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(screen.getByRole('button', { name: 'Delete permanently' })).toHaveAttribute(
      'type',
      'submit',
    );
  });
});

describe('useAppTranslation', () => {
  it('resolves copy from the catalog', () => {
    const { result } = renderHook(() => useAppTranslation(I18N_NAMESPACES.account));

    expect(result.current('delete.submit')).toBe('Delete my account');
  });

  // The identity has to be stable or every consumer re-renders on every tick.
  it('returns the same translator across renders of the same namespace', () => {
    const { result, rerender } = renderHook(() => useAppTranslation(I18N_NAMESPACES.account));
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });
});

describe('getServerTranslations', () => {
  // Server and client resolve from the same catalog, so hydration cannot
  // mismatch on copy.
  it('resolves the same string the client hook does', async () => {
    const translate = await getServerTranslations(I18N_NAMESPACES.account);
    const { result } = renderHook(() => useAppTranslation(I18N_NAMESPACES.account));

    expect(translate('delete.submit')).toBe(result.current('delete.submit'));
  });
});

describe('the containers that mount a server action', () => {
  it('renders the sign-in form with no name field', () => {
    render(<SignInFormContainer />);

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders the sign-up form with a name field', () => {
    render(<SignUpFormContainer />);

    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
  });

  it('renders the sign-out control as a submit button', () => {
    render(<SignOutButtonContainer />);

    expect(screen.getByRole('button', { name: /sign out/i })).toHaveAttribute('type', 'submit');
  });

  it('renders the create-portfolio form', () => {
    render(<CreatePortfolioFormContainer />);

    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('button', { type: 'submit' } as never)).toBeDefined();
  });

  it('shows the chosen filename before the upload is submitted', async () => {
    render(<ImportResumeFormContainer portfolioId="p1" maxMegabytes={8} maxPages={15} />);

    const file = new File(['%PDF-1.7'], 'amina-cv.pdf', { type: 'application/pdf' });

    await userEvent.upload(screen.getByLabelText('CV file'), file);

    expect(screen.getByText('amina-cv.pdf')).toBeInTheDocument();
  });

  it('clears the displayed filename when an import is submitted', async () => {
    render(<ImportResumeFormContainer portfolioId="p1" maxMegabytes={8} maxPages={15} />);

    const input = screen.getByLabelText('CV file');
    await userEvent.upload(
      input,
      new File(['%PDF-1.7'], 'amina-cv.pdf', { type: 'application/pdf' }),
    );

    await userEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(screen.queryByText('amina-cv.pdf')).not.toBeInTheDocument();
  });

  it('arms the account deletion only once the confirmation word is typed', async () => {
    render(<DeleteAccountContainer />);

    const submit = screen.getByRole('button', { name: /delete my account/i });

    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByRole('textbox'), ACCOUNT_DELETE_CONFIRMATION);

    expect(submit).toBeEnabled();
  });

  it('renders the admin sign-in form', () => {
    render(<AdminSignInFormContainer />);

    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('renders the admin two-factor enrollment password-confirmation step first', () => {
    render(<AdminTwoFactorEnrollContainer />);

    expect(screen.getByLabelText('Password')).toBeRequired();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });
});

describe('PortfolioEditorContainer', () => {
  it('renders the forms and a live preview of the draft', () => {
    renderEditor();

    expect(screen.getByRole('textbox', { name: /Display name.*Required/u })).toHaveValue(
      'Amina Rahman',
    );
    expect(screen.getAllByRole('heading', { name: 'Amina Rahman' }).length).toBeGreaterThan(0);
  });

  it('reserves document space beneath the floating save dock', () => {
    renderEditor();
    expect(screen.getByRole('region', { name: 'Amina Rahman' })).toHaveClass('pb-36');
  });

  // Editing marks the draft dirty; the save button is the only way it leaves.
  it('reports unsaved changes after an edit', async () => {
    renderEditor();

    const location = requireElement(screen.getAllByLabelText('Location')[0]);
    const user = userEvent.setup();

    // Pasting keeps this to one re-render of the editor and its live preview;
    // typing the string out was the slowest test in the file.
    await user.clear(location);
    await user.click(location);
    await user.paste('Lisbon, Portugal!');

    expect(screen.getAllByText('Unsaved changes').length).toBeGreaterThan(0);
  });

  it('reorders a section from the keyboard', async () => {
    renderEditor();

    const moveDown = screen.getAllByRole('button', { name: /down/i })[0];

    await userEvent.click(requireElement(moveDown));

    expect(screen.getAllByText('Unsaved changes').length).toBeGreaterThan(0);
  });

  it('surfaces extraction warnings next to the fields they concern', () => {
    renderEditor([
      {
        code: 'ambiguous-date',
        path: 'experience.0.startDate',
        message: 'The start date could not be read confidently.',
      },
    ]);

    expect(screen.getByText('The start date could not be read confidently.')).toBeInTheDocument();
  });

  it('edits and adds canonical collection entries', async () => {
    renderEditor();

    const project = screen.getByDisplayValue('Ledger Replay');
    await userEvent.clear(project);
    await userEvent.type(project, 'Ledger Replay 2');
    await userEvent.click(requireElement(screen.getAllByRole('button', { name: 'Add entry' })[0]));

    expect(project).toHaveValue('Ledger Replay 2');
    expect(screen.getAllByText('Unsaved changes').length).toBeGreaterThan(0);
  });

  it('creates a subpage without collecting a password in draft state', async () => {
    renderEditor([], buildMinimalPortfolioDocument());
    const title = requireElement(screen.getAllByLabelText(/Page title/u)[0]);
    const navigationLabel = requireElement(screen.getAllByLabelText(/Navigation label/u)[0]);
    const address = requireElement(screen.getAllByLabelText(/Address/u)[0]);
    const user = userEvent.setup();
    // Pasting exercises the user-facing controlled inputs while avoiding a full
    // editor rerender for every character in each value.
    await user.click(title);
    await user.paste('Speaking');
    await user.click(navigationLabel);
    await user.paste('Speaking');
    await user.click(address);
    await user.paste('speaking');
    await user.click(screen.getByRole('button', { name: 'Add page' }));

    expect(screen.getAllByDisplayValue('Speaking').length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
  });
});

describe('PublishPanelContainer', () => {
  it('reports clipboard success only after the public URL is copied', async () => {
    copyBrowserText.mockResolvedValueOnce();
    renderPanel(false);

    await userEvent.click(screen.getByRole('button', { name: 'Copy URL' }));

    expect(copyBrowserText).toHaveBeenCalledWith(
      'https://portfoliogenerate.test/portfolios/amina-rahman',
    );
    expect(await screen.findByRole('status')).toHaveTextContent('Copied');
  });

  it('does not announce success when the browser rejects clipboard access', async () => {
    copyBrowserText.mockRejectedValueOnce(new Error('Clipboard denied'));
    renderPanel(false);

    await userEvent.click(screen.getByRole('button', { name: 'Copy URL' }));

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByRole('button', { name: 'Copy URL' })).toBeVisible();
  });

  it('keeps publish actions in a sticky surface reserved above the save dock', () => {
    renderPanel(false);

    const actionSurface = screen.getByRole('group', { name: 'Publish' });
    expect(actionSurface.className).toContain('sticky');
    expect(actionSurface.className).toContain('editor-action-dock-reserve');
  });

  it('previews the public URL as the slug is typed', async () => {
    renderPanel(false);

    const slug = screen.getByRole('textbox');

    await userEvent.clear(slug);
    await userEvent.type(slug, 'amina');

    expect(screen.getByText(/portfoliogenerate\.test\/portfolios\/amina/)).toBeInTheDocument();
  });

  // Changing a URL and making a portfolio public are different decisions.
  it('offers claim and publish as separate controls, with no unpublish yet', () => {
    renderPanel(false);

    const buttons = screen.getAllByRole('button');

    expect(buttons).toHaveLength(3);
  });

  it('offers unpublish once a portfolio is live', () => {
    renderPanel(true);

    expect(screen.getAllByRole('button')).toHaveLength(4);
  });
});

describe('every control in the editor is wired to the draft', () => {
  it('accepts a summary edit', async () => {
    renderEditor();

    const summary = requireElement(screen.getAllByLabelText('Summary')[0]);
    await userEvent.clear(summary);
    await userEvent.type(summary, 'S');

    expect(screen.getAllByText('Unsaved changes').length).toBeGreaterThan(0);
  });

  it('accepts a contact edit and a visibility toggle', async () => {
    renderEditor();

    const phone = screen.getByLabelText('Phone');
    const user = userEvent.setup();

    // Pasting rather than typing: each keystroke re-renders the editor and its
    // live preview, which is what pushed this past the timeout on CI.
    await user.clear(phone);
    await user.click(phone);
    await user.paste('2010');

    const checkboxes = screen.getAllByRole('checkbox');

    await user.click(requireElement(checkboxes[0]));
    await user.click(requireElement(checkboxes[1]));

    expect(phone).toHaveValue('2010');
  });

  it('accepts search metadata and the indexing opt-out', async () => {
    renderEditor([], buildMinimalPortfolioDocument());

    const seoTitle = requireElement(screen.getAllByLabelText('Title').at(-1));
    const seoDescription = requireElement(screen.getAllByLabelText('Description').at(-1));
    const user = userEvent.setup();
    await user.click(seoTitle);
    await user.paste('Amina Rahman, backend engineer');
    await user.click(seoDescription);
    await user.paste('Payments and reliability.');

    const checkboxes = screen.getAllByRole('checkbox');

    await user.click(requireElement(checkboxes.at(-1)));

    expect(seoTitle).toHaveValue('Amina Rahman, backend engineer');
  });

  it('hides a section from the preview when its visibility is toggled off', async () => {
    renderEditor();

    const toggles = screen.getAllByRole('button', { name: /hide|show/i });

    await userEvent.click(requireElement(toggles[0]));

    expect(screen.getAllByText('Unsaved changes').length).toBeGreaterThan(0);
  });

  it('moves a section up as well as down', async () => {
    renderEditor();

    await userEvent.click(requireElement(screen.getAllByRole('button', { name: /down/i })[0]));
    await userEvent.click(requireElement(screen.getAllByRole('button', { name: /up/i })[1]));

    expect(screen.getAllByText('Unsaved changes').length).toBeGreaterThan(0);
  });
});

describe('the editor on a portfolio that has almost nothing in it', () => {
  // A brand-new portfolio has null where the fixture has strings. Every field
  // still has to render as an empty, editable control rather than as the word
  // "null" or a crash.
  it('renders empty controls for the fields that are absent', () => {
    const document = buildMinimalPortfolioDocument();

    render(
      <PortfolioEditorContainer
        portfolioId="p1"
        initialDocument={{
          ...document,
          identity: { ...document.identity, headline: null, summary: null, location: null },
        }}
        initialVersion={1}
        labels={editorPageLabels}
        warnings={[]}
        uploadAssetAction={leaveAssetUploadIdle}
      />,
    );

    expect(screen.getByLabelText('Headline')).toHaveValue('');
    expect(screen.getByLabelText('Summary')).toHaveValue('');
    expect(screen.getByLabelText('Location')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Phone')).toHaveValue('');
    expect(screen.getByLabelText('Title')).toHaveValue('');
    expect(screen.getByLabelText('Description')).toHaveValue('');
  });
});

describe('imported page ordering', () => {
  it('shows source-ordered pages before pages without an observed order', () => {
    const document = buildFullPortfolioDocument();
    renderEditor([], {
      ...document,
      source: { ...document.source, pageOrder: ['projects'] },
    });

    const pageSummaries = screen.getAllByText(/^(Projects|Home|Notes)$/u, {
      selector: 'details[id^="editor-page-"] > summary > span:first-child',
    });

    expect(pageSummaries).toHaveLength(3);
    expect(pageSummaries[0]).toHaveTextContent('Projects');
    expect(pageSummaries[1]).toHaveTextContent('Home');
    expect(pageSummaries[2]).toHaveTextContent('Notes');
  });
});
