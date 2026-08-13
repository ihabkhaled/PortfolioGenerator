import type { ReactElement } from 'react';

import { Button, Input, Label } from '@/packages/ui-primitives';

import { adminUsersClasses } from '../constants/admin-users-style.constants';
import type { AdminUserSearchFormProps } from '../types/admin-users-view.types';

/**
 * A plain `GET` form: submitting it navigates the browser to `action` with
 * the field values appended as a query string, so search state lives in the
 * URL and survives a refresh or a share without any client-side fetching.
 * The hidden `page` field resets pagination to 1 on every new search.
 */
export function AdminUserSearchForm(props: Readonly<AdminUserSearchFormProps>): ReactElement {
  return (
    <form action={props.action} method="get" className={adminUsersClasses.searchForm}>
      <input type="hidden" name={props.pageParamName} value="1" />
      <div className={adminUsersClasses.searchField}>
        <Label htmlFor="admin-users-search">{props.label}</Label>
        <Input
          id="admin-users-search"
          type="search"
          name={props.queryParamName}
          defaultValue={props.queryValue}
          placeholder={props.placeholder}
        />
      </div>
      <Button type="submit" variant="secondary">
        {props.submitLabel}
      </Button>
    </form>
  );
}
