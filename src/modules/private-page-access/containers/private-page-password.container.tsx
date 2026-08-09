'use client';
// client-boundary-reason: action progress and draft-version synchronization are browser-owned state.

import { useActionState, useEffect } from 'react';
import type { ReactElement } from 'react';

import { Button, Input, Label, Select } from '@/packages/ui-primitives';

import { setPrivatePageAccessAction } from '../actions/private-page-owner.actions';
import { privatePageOwnerClasses } from '../constants/private-page-owner-style.constants';
import {
  PRIVATE_PAGE_OWNER_FIELDS,
  PRIVATE_PAGE_OWNER_INITIAL_STATE,
  PRIVATE_PAGE_PASSWORD_MIN_LENGTH,
} from '../constants/private-page-owner.constants';
import type { PrivatePagePasswordContainerProps } from '../types/private-page-owner.types';

export function PrivatePagePasswordContainer(
  props: PrivatePagePasswordContainerProps,
): ReactElement {
  const [state, action, pending] = useActionState(
    setPrivatePageAccessAction,
    PRIVATE_PAGE_OWNER_INITIAL_STATE,
  );
  const { onVersionChange } = props;
  const { status, version } = state;

  useEffect(() => {
    if (status === 'success' && version !== null) {
      onVersionChange(version);
    }
  }, [onVersionChange, status, version]);

  return (
    <form action={action} className={privatePageOwnerClasses.form}>
      <input type="hidden" name={PRIVATE_PAGE_OWNER_FIELDS.portfolioId} value={props.portfolioId} />
      <input type="hidden" name={PRIVATE_PAGE_OWNER_FIELDS.pageId} value={props.pageId} />
      <input
        type="hidden"
        name={PRIVATE_PAGE_OWNER_FIELDS.expectedVersion}
        value={state.version ?? props.expectedVersion}
      />
      <div className={privatePageOwnerClasses.field}>
        <Label htmlFor={`${props.pageId}-visibility`}>{props.labels.visibility}</Label>
        <Select
          id={`${props.pageId}-visibility`}
          name={PRIVATE_PAGE_OWNER_FIELDS.visibility}
          defaultValue={props.currentVisibility}
        >
          <option value="public">{props.labels.publicOption}</option>
          <option value="private">{props.labels.privateOption}</option>
        </Select>
      </div>
      <div className={privatePageOwnerClasses.field}>
        <Label htmlFor={`${props.pageId}-password`}>{props.labels.password}</Label>
        <Input
          id={`${props.pageId}-password`}
          name={PRIVATE_PAGE_OWNER_FIELDS.password}
          type="password"
          autoComplete="new-password"
          minLength={PRIVATE_PAGE_PASSWORD_MIN_LENGTH}
        />
        <p className={privatePageOwnerClasses.hint}>{props.labels.passwordHint}</p>
      </div>
      {state.status === 'success' ? (
        <p className={privatePageOwnerClasses.status}>{props.labels.success}</p>
      ) : null}
      {state.error === null ? null : (
        <p className={privatePageOwnerClasses.error} role="alert">
          {props.labels.errors[state.error]}
        </p>
      )}
      <Button type="submit" disabled={pending} className={privatePageOwnerClasses.submit}>
        {props.labels.submit}
      </Button>
    </form>
  );
}
