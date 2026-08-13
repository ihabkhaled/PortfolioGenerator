import type { ReactElement } from 'react';

import { Button, Input, Label, PasswordInput, Select } from '@/packages/ui-primitives';

import { adminAdminsClasses } from '../constants/admin-admins-style.constants';
import { ADMIN_ADMIN_FIELD_NAMES } from '../constants/admin-admins.constants';
import type { AdminAdminCreateFormProps } from '../types/admin-admins-view.types';

/**
 * Name, email, role and an initial password — a plain `POST` form action, no
 * inline handlers. Permissions are never a field here: the action resolves
 * them from `DEFAULT_ROLE_PERMISSIONS[role]` at creation, the same way
 * `support/seed-super-admin.mts` resolves the super admin's.
 */
export function AdminAdminCreateForm(props: Readonly<AdminAdminCreateFormProps>): ReactElement {
  return (
    <section className={adminAdminsClasses.formCard}>
      <div className={adminAdminsClasses.formHeader}>
        <h2 className={adminAdminsClasses.formTitle}>{props.labels.title}</h2>
        <p className={adminAdminsClasses.formLead}>{props.labels.lead}</p>
      </div>
      <form action={props.action} className={adminAdminsClasses.formGrid}>
        <div className={adminAdminsClasses.formField}>
          <Label htmlFor={ADMIN_ADMIN_FIELD_NAMES.name}>{props.labels.nameLabel}</Label>
          <Input
            id={ADMIN_ADMIN_FIELD_NAMES.name}
            name={ADMIN_ADMIN_FIELD_NAMES.name}
            autoComplete="name"
            required
          />
        </div>
        <div className={adminAdminsClasses.formField}>
          <Label htmlFor={ADMIN_ADMIN_FIELD_NAMES.email}>{props.labels.emailLabel}</Label>
          <Input
            id={ADMIN_ADMIN_FIELD_NAMES.email}
            name={ADMIN_ADMIN_FIELD_NAMES.email}
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className={adminAdminsClasses.formField}>
          <Label htmlFor={ADMIN_ADMIN_FIELD_NAMES.role}>{props.labels.roleLabel}</Label>
          <Select id={ADMIN_ADMIN_FIELD_NAMES.role} name={ADMIN_ADMIN_FIELD_NAMES.role}>
            {props.roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div className={adminAdminsClasses.formField}>
          <Label htmlFor={ADMIN_ADMIN_FIELD_NAMES.password}>{props.labels.passwordLabel}</Label>
          <PasswordInput
            id={ADMIN_ADMIN_FIELD_NAMES.password}
            name={ADMIN_ADMIN_FIELD_NAMES.password}
            autoComplete="new-password"
            required
            showLabel={props.labels.showPassword}
            hideLabel={props.labels.hidePassword}
          />
        </div>
        {props.successMessage === null ? null : (
          <p className={adminAdminsClasses.formSuccess} role="status">
            {props.successMessage}
          </p>
        )}
        {props.errorMessage === null ? null : (
          <p className={adminAdminsClasses.formError} role="alert">
            {props.errorMessage}
          </p>
        )}
        <Button type="submit" disabled={props.isPending} className={adminAdminsClasses.formSubmit}>
          {props.isPending ? props.labels.pendingLabel : props.labels.submitLabel}
        </Button>
      </form>
    </section>
  );
}
