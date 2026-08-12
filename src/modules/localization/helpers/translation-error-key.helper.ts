import {
  TRANSLATION_ACTION_ERROR_KEY,
  TRANSLATION_QUOTA_ERROR_KEY,
} from '../constants/translation-action.constants';
import type { TranslationFailureReason } from '../types/translation.types';

export function translationErrorKey(reason: TranslationFailureReason): string {
  return reason === 'quota-exceeded' ? TRANSLATION_QUOTA_ERROR_KEY : TRANSLATION_ACTION_ERROR_KEY;
}
