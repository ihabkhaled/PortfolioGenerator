import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  AdminAccountMenu,
  AdminAccountSummary,
  AdminAdminsTable,
  AdminAuditLogFilters,
  AdminAuditLogTable,
  AdminPagination,
  AdminPermissionEditor,
  AdminPermissionMatrix,
  AdminPortfolioFilters,
  AdminPortfolioTable,
  AdminRbacPickerTable,
  AdminShell,
  AdminSignInForm,
  AdminTopBar,
  AdminTwoFactorEnroll,
  AdminUserPortfoliosTable,
  AdminUserProfile,
  AdminUserSearchForm,
  AdminUsersPagination,
  AdminUsersTable,
} from '../admin-ui';
import { AdminAdminCreateForm } from '../components/admin-admin-create-form.component';

const action = vi.fn<(formData: FormData) => void>();
const labels = {
  title: 'Title',
  lead: 'Lead',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  codeLabel: 'Code',
  submitLabel: 'Submit',
  pendingLabel: 'Pending',
};

describe('admin presentational components', () => {
  it('renders authentication branches and enrollment details', () => {
    const { rerender } = render(
      <AdminSignInForm
        state={{ status: 'idle', error: null }}
        action={action}
        isPending={false}
        errorMessage={null}
        labels={labels}
      />,
    );
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    rerender(
      <AdminSignInForm
        state={{ status: 'needs-two-factor', error: null }}
        action={action}
        isPending
        errorMessage="Wrong code"
        labels={labels}
      />,
    );
    expect(screen.getByLabelText('Code')).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByRole('alert')).toHaveTextContent('Wrong code');
    expect(screen.getByRole('button')).toHaveTextContent('Pending');

    rerender(
      <AdminTwoFactorEnroll
        enrollment={{
          totpUri: 'otpauth://totp/test',
          qrCodeDataUrl: 'data:image/png;base64,AA==',
          backupCodes: ['one', 'two'],
        }}
        state={{ status: 'idle', error: null }}
        action={action}
        isPending={false}
        errorMessage="Retry"
        labels={{
          enrollTitle: 'Enroll',
          enrollLead: 'Scan',
          qrAlt: 'QR',
          confirmCodeLabel: 'Confirm code',
          submitLabel: 'Confirm',
          pendingLabel: 'Confirming',
        }}
      />,
    );
    expect(screen.getByAltText('QR')).toBeInTheDocument();
    expect(screen.getByText('one')).toBeInTheDocument();
  });

  it('renders shell, top bar, account menu and account summary', () => {
    render(
      <AdminShell
        brandLabel="Admin"
        navAriaLabel="Admin navigation"
        topBar={
          <AdminTopBar
            homeHref="/"
            homeLabel="Home"
            brandLabel="Admin"
            actions={<span>Theme</span>}
            accountMenu={
              <AdminAccountMenu
                name="Ada"
                email="ada@example.com"
                roleName="Admin"
                menuLabel="Account"
                preferencesHref="/managawy/account"
                preferencesLabel="Preferences"
                changePasswordHref="/managawy/account#password"
                changePasswordLabel="Password"
                logout={<button>Logout</button>}
              />
            }
          />
        }
        navItems={[
          { id: 'current', label: 'Users', href: '/managawy/users', isCurrent: true },
          { id: 'other', label: 'Portfolios', href: '/managawy/portfolios', isCurrent: false },
          { id: 'disabled', label: 'Disabled', href: null, isCurrent: false },
        ]}
      >
        <AdminAccountSummary
          title="Profile"
          nameLabel="Name"
          name="Ada"
          emailLabel="Email"
          email="ada@example.com"
          roleLabel="Role"
          roleName="Admin"
          permissionsLabel="Permissions"
          permissions={['View users']}
        />
      </AdminShell>,
    );
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByText('Disabled')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText('View users')).toBeInTheDocument();
  });

  it('falls back to the email initial when the admin name is empty', () => {
    render(
      <AdminAccountMenu
        name=""
        email="ada@example.com"
        roleName="Admin"
        menuLabel="Account"
        preferencesHref="/managawy/account"
        preferencesLabel="Preferences"
        changePasswordHref="/managawy/account#password"
        changePasswordLabel="Password"
        logout={<button>Logout</button>}
      />,
    );

    expect(screen.getByText('A', { selector: '[aria-hidden="true"]' })).toBeInTheDocument();
  });

  it('renders portfolio filters, rows, and both pagination boundaries', () => {
    const { rerender } = render(
      <AdminPortfolioFilters
        action="/managawy/portfolios"
        queryFieldName="q"
        query="ada"
        searchLabel="Search"
        searchPlaceholder="Find"
        statusFieldName="status"
        status="all"
        statusLabel="Status"
        statusOptions={[{ value: 'all', label: 'All' }]}
        submitLabel="Apply"
      />,
    );
    expect(screen.getByDisplayValue('ada')).toBeInTheDocument();
    rerender(
      <AdminPortfolioTable
        rows={[
          {
            id: 'p1',
            slug: 'ada',
            portfolioHref: '/ada',
            ownerId: 'u1',
            ownerEmail: 'ada@example.com',
            ownerHref: '/managawy/users/u1',
            statusLabel: 'Published',
            statusTone: 'success',
            isSuspended: false,
            suspendedLabel: 'No',
            suspendedTone: 'neutral',
            updatedAtLabel: 'Today',
            actions: <button>Moderate</button>,
          },
        ]}
        columnLabels={{
          slug: 'Slug',
          owner: 'Owner',
          status: 'Status',
          suspended: 'Suspended',
          updated: 'Updated',
          actions: 'Actions',
        }}
      />,
    );
    expect(screen.getByRole('link', { name: 'ada' })).toHaveAttribute('href', '/ada');
    rerender(
      <AdminPagination
        summaryLabel="Page 1"
        previousLabel="Previous"
        previousHref={null}
        nextLabel="Next"
        nextHref="/managawy/portfolios?page=2"
      />,
    );
    expect(screen.getByText('Previous')).toHaveAttribute('aria-disabled', 'true');
    rerender(
      <AdminPagination
        summaryLabel="Page 2"
        previousLabel="Previous"
        previousHref="/managawy/portfolios"
        nextLabel="Next"
        nextHref={null}
      />,
    );
    expect(screen.getByText('Next')).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders users, portfolios, profile, search, and pagination variants', () => {
    const user = {
      id: 'u1',
      name: 'Ada',
      email: 'ada@example.com',
      verifiedLabel: 'Yes',
      status: 'ACTIVE' as const,
      statusBadge: { label: 'Active', tone: 'success' as const },
      portfolioCountLabel: '1',
      joinedLabel: 'Today',
      detailHref: '/managawy/users/u1',
      actions: <button>Suspend</button>,
    };
    const { rerender } = render(
      <AdminUsersTable
        items={[user]}
        columnLabels={{
          name: 'Name',
          email: 'Email',
          verified: 'Verified',
          status: 'Status',
          portfolios: 'Portfolios',
          joined: 'Joined',
          actions: 'Actions',
        }}
      />,
    );
    expect(screen.getByRole('link', { name: 'Ada' })).toBeInTheDocument();
    rerender(
      <AdminUserProfile
        nameLabel="Name"
        name="Ada"
        emailLabel="Email"
        email="ada@example.com"
        verifiedLabel="Verified"
        verifiedValue="Yes"
        statusLabel="Status"
        statusBadge={{ label: 'Active', tone: 'success' }}
        joinedLabel="Joined"
        joinedValue="Today"
        statusAction={<button>Suspend</button>}
        resetPasswordAction={<button>Reset</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
    rerender(
      <AdminUserPortfoliosTable
        items={[
          {
            id: 'p1',
            slug: 'ada',
            statusBadge: { label: 'Published', tone: 'success' },
            suspendedBadge: { label: 'Suspended', tone: 'danger' },
            updatedLabel: 'Today',
            publicHref: '/ada',
            publicLabel: 'Public',
            adminPortfoliosHref: '/managawy/portfolios?q=ada',
            adminPortfoliosLabel: 'Admin',
          },
          {
            id: 'p2',
            slug: 'lin',
            statusBadge: { label: 'Draft', tone: 'neutral' },
            suspendedBadge: null,
            updatedLabel: 'Yesterday',
            publicHref: '/lin',
            publicLabel: 'Public',
            adminPortfoliosHref: '/managawy/portfolios?q=lin',
            adminPortfoliosLabel: 'Admin',
          },
        ]}
        columnLabels={{ slug: 'Slug', status: 'Status', updated: 'Updated', links: 'Links' }}
      />,
    );
    expect(screen.getByText('Suspended')).toBeInTheDocument();
    rerender(
      <AdminUserSearchForm
        action="/managawy/users"
        queryParamName="q"
        pageParamName="page"
        queryValue="ada"
        label="Search users"
        placeholder="Find user"
        submitLabel="Search"
      />,
    );
    expect(screen.getByDisplayValue('ada')).toBeInTheDocument();
    rerender(
      <AdminUsersPagination
        statusLabel="Page"
        prevHref={null}
        nextHref="/managawy/users?page=2"
        prevLabel="Previous"
        nextLabel="Next"
      />,
    );
    expect(screen.getByText('Previous')).toHaveAttribute('aria-disabled', 'true');
    rerender(
      <AdminUsersPagination
        statusLabel="Page"
        prevHref="/managawy/users"
        nextHref={null}
        prevLabel="Previous"
        nextLabel="Next"
      />,
    );
    expect(screen.getByText('Next')).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders admin roster badges and create-form outcomes', () => {
    const item = {
      id: 'a1',
      name: 'Root',
      email: 'root@example.com',
      roleLabel: 'Super admin',
      status: 'ACTIVE' as const,
      statusBadge: { label: 'Active', tone: 'success' as const },
      twoFactorLabel: 'Yes',
      joinedLabel: 'Today',
      isSuperAdmin: true,
      isSelf: true,
      actions: null,
    };
    const ordinary = { ...item, id: 'a2', name: 'Ada', isSuperAdmin: false, isSelf: false };
    const { rerender } = render(
      <AdminAdminsTable
        items={[item, ordinary]}
        protectedLabel="Protected"
        selfLabel="You"
        columnLabels={{
          name: 'Name',
          email: 'Email',
          role: 'Role',
          status: 'Status',
          twoFactor: '2FA',
          joined: 'Joined',
          actions: 'Actions',
        }}
      />,
    );
    expect(screen.getByText('Protected')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
    rerender(
      <AdminAdminCreateForm
        action={action}
        isPending
        errorMessage="Failed"
        successMessage="Created"
        roleOptions={[{ value: 'ADMIN', label: 'Admin' }]}
        labels={{
          title: 'Create',
          lead: 'Add admin',
          nameLabel: 'Name',
          emailLabel: 'Email',
          roleLabel: 'Role',
          passwordLabel: 'Password',
          showPassword: 'Show',
          hidePassword: 'Hide',
          submitLabel: 'Create',
          pendingLabel: 'Creating',
        }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Failed');
    expect(screen.getByRole('status')).toHaveTextContent('Created');
    rerender(
      <AdminAdminCreateForm
        action={action}
        isPending={false}
        errorMessage={null}
        successMessage={null}
        roleOptions={[]}
        labels={{
          title: 'Create',
          lead: 'Add admin',
          nameLabel: 'Name',
          emailLabel: 'Email',
          roleLabel: 'Role',
          passwordLabel: 'Password',
          showPassword: 'Show',
          hidePassword: 'Hide',
          submitLabel: 'Create',
          pendingLabel: 'Creating',
        }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Create' })).toBeEnabled();
  });

  it('renders audit filters and both audit-row branches', () => {
    const options = [{ value: 'all', label: 'All' }];
    const { rerender } = render(
      <AdminAuditLogFilters
        action="/managawy/audit-log"
        queryFieldName="q"
        query="u1"
        searchLabel="Search"
        searchPlaceholder="Target"
        adminFieldName="admin"
        adminValue="all"
        adminLabel="Admin"
        adminOptions={options}
        targetTypeFieldName="type"
        targetTypeValue="all"
        targetTypeLabel="Type"
        targetTypeOptions={options}
        actionFieldName="event"
        actionValue="all"
        actionLabel="Action"
        actionOptions={options}
        submitLabel="Apply"
      />,
    );
    expect(screen.getByDisplayValue('u1')).toBeInTheDocument();
    rerender(
      <AdminAuditLogTable
        rows={[
          {
            id: '1',
            whenLabel: 'Today',
            whenIso: '2026-01-01',
            adminLabel: 'Ada',
            actionLabel: 'Suspended',
            actionCode: 'admin.user.suspended',
            targetTypeLabel: 'User',
            targetId: 'u1',
            targetHref: '/managawy/users/u1',
            metadataEntries: [{ key: 'reason', value: 'abuse' }],
          },
          {
            id: '2',
            whenLabel: 'Yesterday',
            whenIso: '2025-12-31',
            adminLabel: 'Ada',
            actionLabel: 'Login',
            actionCode: 'admin.session.created',
            targetTypeLabel: 'Admin',
            targetId: 'a1',
            targetHref: null,
            metadataEntries: [],
          },
        ]}
        columnLabels={{
          when: 'When',
          admin: 'Admin',
          action: 'Action',
          targetType: 'Type',
          targetId: 'Target',
          metadata: 'Metadata',
        }}
        metadataEmptyLabel="None"
      />,
    );
    expect(screen.getByRole('link', { name: 'u1' })).toBeInTheDocument();
    expect(screen.getByText('None')).toBeInTheDocument();
  });

  it('renders permission matrix, picker variants, and editor states', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <AdminPermissionMatrix
        columns={[{ role: 'ADMIN', label: 'Admin' }]}
        rows={[
          {
            permission: 'USERS_VIEW',
            label: 'View users',
            description: 'Can view',
            grants: [{ role: 'ADMIN', label: 'Granted', tone: 'success' }],
          },
        ]}
        columnLabels={{ permission: 'Permission' }}
      />,
    );
    expect(screen.getByText('Granted')).toBeInTheDocument();
    rerender(
      <AdminRbacPickerTable
        items={[
          {
            id: '1',
            name: 'Ada',
            email: 'ada@example.com',
            roleLabel: 'Admin',
            permissionCountLabel: '1 grant',
            isSelected: true,
            editHref: '/edit/1',
            editLabel: 'Edit',
            selectedLabel: 'Editing',
          },
          {
            id: '2',
            name: 'Lin',
            email: 'lin@example.com',
            roleLabel: 'Moderator',
            permissionCountLabel: '2 grants',
            isSelected: false,
            editHref: '/edit/2',
            editLabel: 'Edit Lin',
            selectedLabel: 'Editing',
          },
        ]}
        columnLabels={{
          name: 'Name',
          email: 'Email',
          role: 'Role',
          permissions: 'Permissions',
          actions: 'Actions',
        }}
      />,
    );
    expect(screen.getByText('Editing')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Edit Lin' })).toBeInTheDocument();
    const editorLabels = {
      heading: 'Edit permissions',
      description: 'Choose',
      targetLabel: 'Target',
      roleLabel: 'Role',
      lockedHint: 'Cannot remove',
      changeAdminLabel: 'Change',
      saveLabel: 'Save',
      confirmMessage: 'Confirm?',
      confirmLabel: 'Confirm',
      cancelLabel: 'Cancel',
      pendingLabel: 'Saving',
    };
    rerender(
      <AdminPermissionEditor
        action={action}
        adminIdFieldName="adminId"
        permissionsFieldName="permissions"
        targetId="1"
        targetName="Ada"
        targetEmail="ada@example.com"
        targetRoleLabel="Admin"
        changeAdminHref="/change"
        rows={[
          {
            permission: 'RBAC_MANAGE',
            label: 'RBAC',
            description: 'Manage roles',
            checked: true,
            locked: true,
          },
          {
            permission: 'USERS_VIEW',
            label: 'Users',
            description: 'View users',
            checked: false,
            locked: false,
          },
        ]}
        labels={editorLabels}
        isConfirming={false}
        isPending={false}
        onArm={vi.fn()}
        onCancel={vi.fn()}
        outcome={<p>Saved</p>}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    rerender(
      <AdminPermissionEditor
        action={action}
        adminIdFieldName="adminId"
        permissionsFieldName="permissions"
        targetId="1"
        targetName="Ada"
        targetEmail="ada@example.com"
        targetRoleLabel="Admin"
        changeAdminHref="/change"
        rows={[]}
        labels={editorLabels}
        isConfirming
        isPending
        onArm={vi.fn()}
        onCancel={vi.fn()}
        outcome={null}
      />,
    );
    expect(screen.getByRole('button', { name: 'Saving' })).toBeDisabled();
  });
});
