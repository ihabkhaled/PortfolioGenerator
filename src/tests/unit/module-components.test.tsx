import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { AccountDisclosure, AccountSummary, accountClasses } from '@/modules/account/account-ui';
import { CredentialForm } from '@/modules/auth';
import {
  LandingCta,
  LandingDirectory,
  LandingFaq,
  LandingHero,
  LandingPrincipleList,
  LandingStepList,
  MarketingTopicPage,
} from '@/modules/marketing';
import {
  ContactFields,
  EditorShell,
  IdentityFields,
  SectionList,
  SeoFields,
  WarningList,
} from '@/modules/portfolio-editor/editor-ui';
import { PortfolioList } from '@/modules/portfolios/dashboard';
import { ImportFactList } from '@/modules/resume-ingestion/ingestion-ui';
import { PageSkeleton } from '@/shared/components/feedback/page-skeleton.component';

import { requireElement } from '../fixtures/dom.fixtures';

/**
 * Components take computed props and return markup, so what is worth asserting
 * is the part a reviewer cannot see from the JSX: the roles and names assistive
 * technology gets, and whether a control that should be unreachable actually is.
 */

const editorLabels = {
  required: 'Required',
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
};

const noop = (): void => undefined;

function sectionEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: 'section-hero',
    label: 'Hero',
    visibilityLabel: 'Hide',
    moveUpLabel: 'Move Hero up',
    moveDownLabel: 'Move Hero down',
    isFirst: true,
    isLast: false,
    onMoveUp: noop,
    onMoveDown: noop,
    onToggleVisibility: noop,
    ...overrides,
  };
}

describe('marketing components', () => {
  it('renders the hero with one first-level heading and both actions', () => {
    render(
      <LandingHero
        eyebrow="CV to portfolio"
        title="Your CV, as a portfolio"
        lead="Upload a PDF."
        supporting="Review before anything is public."
        primaryAction={<button type="button">Start</button>}
        secondaryAction={<button type="button">See an example</button>}
        aside={<p>Example</p>}
      />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your CV, as a portfolio');
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'See an example' })).toBeInTheDocument();
  });

  it('renders principles as an unordered list', () => {
    render(
      <LandingPrincipleList
        principles={[
          { id: 'p1', title: 'Nothing is invented', description: 'Absent stays absent.' },
          { id: 'p2', title: 'You review first', description: 'Import is a draft.' },
        ]}
      />,
    );

    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(2);
  });

  // The sequence is the content: an ordered list says so without a caption.
  it('renders the delivery steps as an ordered list', () => {
    render(
      <LandingStepList
        steps={[
          { id: 's1', index: '01', title: 'Upload', description: 'A PDF CV.' },
          { id: 's2', index: '02', title: 'Review', description: 'Fix what is wrong.' },
        ]}
      />,
    );

    const list = screen.getByRole('list');

    expect(list.tagName).toBe('OL');
    expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  });

  it('renders each frequently asked question as expandable content', () => {
    render(
      <LandingFaq
        items={[
          { id: 'review', question: 'Can I review it?', answer: 'Nothing is public first.' },
          { id: 'own', question: 'Do I own it?', answer: 'Yes.' },
        ]}
      />,
    );

    expect(screen.getAllByText(/Can I review it\?|Do I own it\?/)).toHaveLength(2);
    const firstQuestion = requireElement(screen.getAllByRole('group')[0]);

    expect(firstQuestion).not.toHaveAttribute('open');
  });

  it('renders directory entries as labelled links', () => {
    render(
      <LandingDirectory
        linkLabel="Read guide"
        items={[
          {
            id: 'developers',
            title: 'Developer portfolios',
            description: 'Examples for engineers.',
            href: '/developer-portfolios',
          },
        ]}
      />,
    );

    expect(screen.getByRole('listitem')).toHaveTextContent('Examples for engineers.');
    expect(screen.getByRole('link', { name: 'Read guide' })).toHaveAttribute(
      'href',
      '/developer-portfolios',
    );
  });

  it('keeps the call to action copy and supplied actions together', () => {
    render(
      <LandingCta
        title="Build yours"
        description="Start with the facts in your CV."
        actions={<button type="button">Upload CV</button>}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Build yours' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload CV' })).toBeInTheDocument();
  });

  it('renders topic sections and related navigation under one page heading', () => {
    render(
      <MarketingTopicPage
        eyebrow="Guides"
        title="Portfolio guidance"
        description="A practical introduction."
        sections={[
          { kind: 'use-case', title: 'Use cases', body: 'Use facts' },
          { kind: 'trust-boundary', title: 'Trust boundaries', body: 'Review first' },
        ]}
        related={createElement('a', { href: '/examples' }, 'Examples')}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Portfolio guidance' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Use cases' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Portfolio guidance' })).toContainElement(
      screen.getByRole('link', { name: 'Examples' }),
    );
  });
});

describe('PageSkeleton', () => {
  it('is hidden from assistive technology while preserving the page layout', () => {
    render(<PageSkeleton />);
    const shell = requireElement(
      screen
        .getAllByRole('generic', { hidden: true })
        .find((element) => element.getAttribute('aria-hidden') === 'true'),
    );

    expect(shell).toHaveAttribute('aria-hidden', 'true');
    expect(within(shell).getAllByRole('generic', { hidden: true }).length).toBeGreaterThanOrEqual(
      12,
    );
    const animatedSurface = within(shell)
      .getAllByRole('generic', { hidden: true })
      .find((element) => element.className.includes('animate-pulse'));
    expect(animatedSurface).toBeDefined();
    expect(animatedSurface).toHaveClass('motion-reduce:animate-none');
  });
});

describe('PortfolioList', () => {
  it('renders each portfolio with its status and actions', () => {
    render(
      <PortfolioList
        items={[
          {
            id: 'p1',
            title: 'Amina Rahman',
            meta: 'Updated today',
            statusLabel: 'Published',
            statusTone: 'success',
            actions: <button type="button">Edit</button>,
          },
        ]}
      />,
    );

    expect(screen.getByText('Amina Rahman')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
  });
});

describe('ImportFactList', () => {
  // A privacy promise made after the fact is not a promise.
  it('states what happens to an upload as a definition list', () => {
    render(
      <ImportFactList
        facts={[
          { id: 'storage', label: 'Storage', value: 'Private, never public' },
          { id: 'limit', label: 'Limit', value: '8 MB, 15 pages' },
        ]}
      />,
    );

    expect(screen.getByText('Storage')).toBeInTheDocument();
    expect(screen.getByText('Private, never public')).toBeInTheDocument();
  });
});

describe('AccountSummary', () => {
  it('lists what the platform holds about the reader', () => {
    render(
      <AccountSummary
        title="Your account"
        nameLabel="Name"
        name="Amina Rahman"
        emailLabel="Email"
        email="amina@example.com"
        portfolioCountLabel="Portfolios"
        portfolioCount={2}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Your account' })).toBeInTheDocument();
    expect(screen.getByText('amina@example.com')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

describe('AccountDisclosure', () => {
  it('uses one native summary and honors its initial priority', async () => {
    const user = userEvent.setup();
    render(
      <AccountDisclosure title="Preferences" hint="Language and appearance" defaultOpen>
        <label htmlFor="theme">Theme</label>
        <select id="theme" />
      </AccountDisclosure>,
    );

    const disclosure = screen.getByRole('group');
    expect(screen.getAllByText('Preferences')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 2, name: 'Preferences' })).toBeVisible();
    expect(disclosure).toHaveAttribute('open');
    expect(screen.getByLabelText('Theme')).toBeVisible();

    await user.click(screen.getByText('Preferences'));
    expect(disclosure).not.toHaveAttribute('open');
  });

  it('keeps settings panels vertically separated', () => {
    expect(accountClasses.page).toContain('gap-');
  });
});

describe('CredentialForm', () => {
  const labels = {
    name: 'Name',
    email: 'Email',
    password: 'Password',
    passwordHint: 'At least 12 characters.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
  };

  it('renders a sign-in form without a name field', () => {
    render(
      <CredentialForm
        action={noop}
        labels={labels}
        submitLabel="Sign in"
        pendingLabel="Signing in"
        isPending={false}
        includeName={false}
        errorMessage={null}
        noticeMessage={null}
        footer={null}
      />,
    );

    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'current-password');
  });

  it('asks a new account for a name and a fresh password', () => {
    render(
      <CredentialForm
        action={noop}
        labels={labels}
        submitLabel="Create account"
        pendingLabel="Creating"
        isPending={false}
        includeName
        errorMessage={null}
        noticeMessage={null}
        footer={null}
      />,
    );

    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveAttribute('autocomplete', 'new-password');
  });

  // Not colour alone: the failure is announced and carries an icon.
  it('announces an error', () => {
    render(
      <CredentialForm
        action={noop}
        labels={labels}
        submitLabel="Sign in"
        pendingLabel="Signing in"
        isPending={false}
        includeName={false}
        errorMessage="Those details did not match."
        noticeMessage={null}
        footer={null}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Those details did not match.');
  });

  // Not an error — an unverified account is not a failed sign-in attempt, so
  // it is announced as status text, not an alert.
  it('announces a notice', () => {
    render(
      <CredentialForm
        action={noop}
        labels={labels}
        submitLabel="Sign in"
        pendingLabel="Signing in"
        isPending={false}
        includeName={false}
        errorMessage={null}
        noticeMessage="Check your email to verify your account."
        footer={null}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Check your email to verify your account.',
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows the pending label while the action is in flight', () => {
    render(
      <CredentialForm
        action={noop}
        labels={labels}
        submitLabel="Sign in"
        pendingLabel="Signing in"
        isPending
        includeName={false}
        errorMessage={null}
        noticeMessage={null}
        footer={null}
      />,
    );

    expect(screen.getByRole('button', { name: 'Signing in' })).toBeDisabled();
  });
});

describe('editor field components', () => {
  it('binds every identity field to its label', async () => {
    const onDisplayNameChange = vi.fn();

    render(
      <IdentityFields
        labels={editorLabels}
        displayName="Amina Rahman"
        headline="Engineer"
        summary=""
        location="Lisbon"
        nationality="Egyptian"
        militaryStatus="Completed"
        tagline="Welcome"
        availabilityEnabled
        availabilityNote="Open to work"
        coverLetter="Introduction"
        onDisplayNameChange={onDisplayNameChange}
        onHeadlineChange={noop}
        onSummaryChange={noop}
        onLocationChange={noop}
        onNationalityChange={noop}
        onMilitaryStatusChange={noop}
        onTaglineChange={noop}
        onAvailabilityEnabledChange={noop}
        onAvailabilityNoteChange={noop}
        onCoverLetterChange={noop}
      />,
    );

    await userEvent.type(screen.getByLabelText(/^Display name/u), '!');

    expect(onDisplayNameChange).toHaveBeenCalled();
    expect(screen.getByLabelText('Location')).toHaveValue('Lisbon');
  });

  // Extracting a phone number is not consent to publish it.
  it('keeps a contact value and its visibility as separate controls', async () => {
    const onPhoneVisibilityChange = vi.fn();

    render(
      <ContactFields
        labels={editorLabels}
        email="amina@example.com"
        phone="000 000 000"
        isEmailVisible
        isPhoneVisible={false}
        phoneCountryIso="PT"
        countries={[{ iso: 'PT', name: 'Portugal', dial: '+351' }]}
        onPhoneCountryChange={noop}
        onEmailChange={noop}
        onPhoneChange={noop}
        onEmailVisibilityChange={noop}
        onPhoneVisibilityChange={onPhoneVisibilityChange}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');

    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();

    await userEvent.click(requireElement(checkboxes[1]));

    expect(onPhoneVisibilityChange).toHaveBeenCalled();
  });

  it('offers the search opt-out as a checkbox', async () => {
    const onIndexableChange = vi.fn();

    render(
      <SeoFields
        labels={editorLabels}
        title=""
        description=""
        isIndexable
        onTitleChange={noop}
        onDescriptionChange={noop}
        onIndexableChange={onIndexableChange}
      />,
    );

    await userEvent.click(screen.getByRole('checkbox'));

    expect(onIndexableChange).toHaveBeenCalled();
  });
});

describe('SectionList', () => {
  // Buttons rather than drag: reordering is how a user decides what a reader
  // sees first, and a gesture-only control makes that unreachable by keyboard.
  it('disables move-up on the first section and move-down on the last', () => {
    render(
      <SectionList
        title="Sections"
        hint="Order and visibility."
        sections={[
          sectionEntry(),
          sectionEntry({
            id: 'section-about',
            label: 'About',
            moveUpLabel: 'Move About up',
            moveDownLabel: 'Move About down',
            isFirst: false,
            isLast: true,
          }),
        ]}
      />,
    );

    expect(screen.getByRole('button', { name: 'Move Hero up' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Move Hero down' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Move About down' })).toBeDisabled();
  });

  it('calls the reorder and visibility handlers', async () => {
    const onMoveDown = vi.fn();
    const onToggleVisibility = vi.fn();

    render(
      <SectionList
        title="Sections"
        hint="Order and visibility."
        sections={[sectionEntry({ onMoveDown, onToggleVisibility })]}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Move Hero down' }));
    await userEvent.click(screen.getByRole('button', { name: 'Hide' }));

    expect(onMoveDown).toHaveBeenCalledOnce();
    expect(onToggleVisibility).toHaveBeenCalledOnce();
  });
});

describe('WarningList', () => {
  it('renders nothing when the extractor was sure about everything', () => {
    render(<WarningList title="Worth a second look" warnings={[]} />);

    expect(screen.queryByRole('heading', { name: 'Worth a second look' })).not.toBeInTheDocument();
  });

  it('lists each warning message', () => {
    render(
      <WarningList
        title="Worth a second look"
        warnings={[
          {
            code: 'ambiguous-date',
            path: 'experience.0.startDate',
            message: 'The start date could not be read confidently.',
          },
        ]}
      />,
    );

    expect(screen.getByText('The start date could not be read confidently.')).toBeInTheDocument();
  });
});

describe('EditorShell', () => {
  it('places the forms and the preview either side of one heading', () => {
    render(
      <EditorShell
        title="Review and edit"
        subtitle="Nothing is public until you publish."
        actions={<button type="button">Save</button>}
        forms={<p>Forms content</p>}
        preview={<p>Preview content</p>}
        showingPreview={false}
        onEditClick={vi.fn()}
        onPreviewClick={vi.fn()}
        mobileEditLabel="Edit"
        mobilePreviewLabel="Preview"
      />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Review and edit');
    expect(screen.getByText('Forms content')).toBeInTheDocument();
    expect(screen.getByText('Preview content')).toBeInTheDocument();
  });
});
