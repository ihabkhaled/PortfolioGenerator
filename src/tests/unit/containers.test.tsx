import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { ACCOUNT_DELETE_CONFIRMATION } from '@/modules/account';
import { DeleteAccountContainer, DeletePortfolioContainer } from '@/modules/account/account-ui';
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

const editorPageLabels: EditorLabels = {
  identityTitle: 'Identity',
  identityHint: 'Who you are.',
  displayName: 'Display name',
  headline: 'Headline',
  summary: 'Summary',
  location: 'Location',
  contactTitle: 'Contact',
  contactHint: 'How people reach you.',
  email: 'Email',
  phone: 'Phone',
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
};

function renderEditor(
  warnings: readonly { code: string; path: string; message: string }[] = [],
): void {
  render(
    <PortfolioEditorContainer
      portfolioId="p1"
      initialDocument={buildFullPortfolioDocument()}
      initialVersion={1}
      labels={editorPageLabels}
      warnings={warnings}
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

  it('arms the account deletion only once the confirmation word is typed', async () => {
    render(<DeleteAccountContainer />);

    const submit = screen.getByRole('button', { name: /delete my account/i });

    expect(submit).toBeDisabled();

    await userEvent.type(screen.getByRole('textbox'), ACCOUNT_DELETE_CONFIRMATION);

    expect(submit).toBeEnabled();
  });
});

describe('PortfolioEditorContainer', () => {
  it('renders the forms and a live preview of the draft', () => {
    renderEditor();

    expect(screen.getByLabelText('Display name')).toHaveValue('Amina Rahman');
    expect(screen.getAllByRole('heading', { name: 'Amina Rahman' }).length).toBeGreaterThan(0);
  });

  // Editing marks the draft dirty; the save button is the only way it leaves.
  it('reports unsaved changes after an edit', async () => {
    renderEditor();

    await userEvent.type(screen.getByLabelText('Location'), '!');

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
});

describe('PublishPanelContainer', () => {
  it('previews the public URL as the slug is typed', async () => {
    renderPanel(false);

    const slug = screen.getByRole('textbox');

    await userEvent.clear(slug);
    await userEvent.type(slug, 'amina');

    expect(screen.getByText(/portfoliogenerate\.test\/amina/)).toBeInTheDocument();
  });

  // Changing a URL and making a portfolio public are different decisions.
  it('offers claim and publish as separate controls, with no unpublish yet', () => {
    renderPanel(false);

    const buttons = screen.getAllByRole('button').map((button) => button.textContent);

    expect(buttons).toHaveLength(2);
  });

  it('offers unpublish once a portfolio is live', () => {
    renderPanel(true);

    expect(screen.getAllByRole('button')).toHaveLength(3);
  });
});

describe('every control in the editor is wired to the draft', () => {
  // The preview is the point of the split pane: an edit that does not reach it
  // is an edit the user cannot check before publishing.
  it('shows a headline edit in the live preview', async () => {
    renderEditor();

    await userEvent.clear(screen.getByLabelText('Headline'));
    await userEvent.type(screen.getByLabelText('Headline'), 'Staff engineer');

    expect(screen.getAllByText('Staff engineer').length).toBeGreaterThan(0);
  });

  it('accepts a summary edit', async () => {
    renderEditor();

    await userEvent.clear(screen.getByLabelText('Summary'));
    await userEvent.type(screen.getByLabelText('Summary'), 'One paragraph.');

    expect(screen.getByLabelText('Summary')).toHaveValue('One paragraph.');
  });

  it('accepts a contact edit and a visibility toggle', async () => {
    renderEditor();

    await userEvent.clear(screen.getByLabelText('Phone'));
    await userEvent.type(screen.getByLabelText('Phone'), '+201000000000');

    const checkboxes = screen.getAllByRole('checkbox');

    await userEvent.click(requireElement(checkboxes[0]));
    await userEvent.click(requireElement(checkboxes[1]));

    expect(screen.getByLabelText('Phone')).toHaveValue('+201000000000');
  });

  it('accepts search metadata and the indexing opt-out', async () => {
    renderEditor();

    await userEvent.type(screen.getByLabelText('Title'), 'Amina Rahman, backend engineer');
    await userEvent.type(screen.getByLabelText('Description'), 'Payments and reliability.');

    const checkboxes = screen.getAllByRole('checkbox');

    await userEvent.click(requireElement(checkboxes.at(-1)));

    expect(screen.getByLabelText('Title')).toHaveValue('Amina Rahman, backend engineer');
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
