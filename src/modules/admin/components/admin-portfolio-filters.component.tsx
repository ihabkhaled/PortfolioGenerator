import type { ReactElement } from 'react';

import { Button, Input, Label, Select } from '@/packages/ui-primitives';

import { adminPortfolioClasses } from '../constants/admin-portfolio-style.constants';
import type { AdminPortfolioFiltersProps } from '../types/admin-portfolio-view.types';

/**
 * Search and status filter, as one plain GET form.
 *
 * No `onChange` auto-submit on the status select: a single submit button
 * covers both fields, which keeps this page a server component with no
 * client-side fetching at all.
 */
export function AdminPortfolioFilters(props: Readonly<AdminPortfolioFiltersProps>): ReactElement {
  return (
    <form method="get" action={props.action} className={adminPortfolioClasses.filters}>
      <div className={adminPortfolioClasses.filterField}>
        <Label htmlFor={props.queryFieldName}>{props.searchLabel}</Label>
        <Input
          id={props.queryFieldName}
          name={props.queryFieldName}
          type="search"
          defaultValue={props.query}
          placeholder={props.searchPlaceholder}
        />
      </div>
      <div className={adminPortfolioClasses.filterField}>
        <Label htmlFor={props.statusFieldName}>{props.statusLabel}</Label>
        <Select id={props.statusFieldName} name={props.statusFieldName} defaultValue={props.status}>
          {props.statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit">{props.submitLabel}</Button>
    </form>
  );
}
