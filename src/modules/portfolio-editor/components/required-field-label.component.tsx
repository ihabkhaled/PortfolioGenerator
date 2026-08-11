import type { ReactElement } from 'react';

import { Label } from '@/packages/ui-primitives';

import { editorClasses } from '../constants/editor-style.constants';
import type { RequiredFieldLabelProps } from '../types/editor.types';

export function RequiredFieldLabel(props: Readonly<RequiredFieldLabelProps>): ReactElement {
  return (
    <Label id={`${props.htmlFor}-label`} htmlFor={props.htmlFor}>
      {props.label}
      <span aria-hidden> *</span>
      <span className={editorClasses.requiredText}> ({props.requiredLabel})</span>
    </Label>
  );
}
