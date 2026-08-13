import type { ReactElement } from 'react';

import { Button, Input, Label, Select } from '@/packages/ui-primitives';

import { adminAuditLogClasses } from '../constants/admin-audit-log-style.constants';
import type { AdminAuditLogFiltersProps } from '../types/admin-audit-log-view.types';

/**
 * Target-id search plus the acting-admin, target-type and action filters, as
 * one plain GET form.
 *
 * No `onChange` auto-submit on the selects: a single submit button covers
 * every field, which keeps this page a server component with no client-side
 * fetching at all — mirroring `AdminPortfolioFilters`.
 */
export function AdminAuditLogFilters(props: Readonly<AdminAuditLogFiltersProps>): ReactElement {
  return (
    <form method="get" action={props.action} className={adminAuditLogClasses.filters}>
      <div className={adminAuditLogClasses.filterField}>
        <Label htmlFor={props.queryFieldName}>{props.searchLabel}</Label>
        <Input
          id={props.queryFieldName}
          name={props.queryFieldName}
          type="search"
          defaultValue={props.query}
          placeholder={props.searchPlaceholder}
        />
      </div>
      <div className={adminAuditLogClasses.filterField}>
        <Label htmlFor={props.adminFieldName}>{props.adminLabel}</Label>
        <Select
          id={props.adminFieldName}
          name={props.adminFieldName}
          defaultValue={props.adminValue}
        >
          {props.adminOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className={adminAuditLogClasses.filterField}>
        <Label htmlFor={props.targetTypeFieldName}>{props.targetTypeLabel}</Label>
        <Select
          id={props.targetTypeFieldName}
          name={props.targetTypeFieldName}
          defaultValue={props.targetTypeValue}
        >
          {props.targetTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div className={adminAuditLogClasses.filterField}>
        <Label htmlFor={props.actionFieldName}>{props.actionLabel}</Label>
        <Select
          id={props.actionFieldName}
          name={props.actionFieldName}
          defaultValue={props.actionValue}
        >
          {props.actionOptions.map((option) => (
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
