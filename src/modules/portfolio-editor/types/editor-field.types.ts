import type { ChangeEventHandler } from 'react';

import type { EditorLabels } from './editor-view.types';

type TextChange = ChangeEventHandler<HTMLInputElement>;
type AreaChange = ChangeEventHandler<HTMLTextAreaElement>;

export interface IdentityFieldsProps {
  readonly labels: EditorLabels;
  readonly displayName: string;
  readonly headline: string;
  readonly summary: string;
  readonly location: string;
  readonly onDisplayNameChange: TextChange;
  readonly onHeadlineChange: TextChange;
  readonly onSummaryChange: AreaChange;
  readonly onLocationChange: TextChange;
}

export interface ContactFieldsProps {
  readonly labels: EditorLabels;
  readonly email: string;
  readonly phone: string;
  readonly isEmailVisible: boolean;
  readonly isPhoneVisible: boolean;
  readonly onEmailChange: TextChange;
  readonly onPhoneChange: TextChange;
  readonly onEmailVisibilityChange: TextChange;
  readonly onPhoneVisibilityChange: TextChange;
}

export interface SeoFieldsProps {
  readonly labels: EditorLabels;
  readonly title: string;
  readonly description: string;
  readonly isIndexable: boolean;
  readonly onTitleChange: TextChange;
  readonly onDescriptionChange: AreaChange;
  readonly onIndexableChange: TextChange;
}
