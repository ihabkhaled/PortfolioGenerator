import type { ReviewSnapshot, TranslationSnapshots } from '../types/translation.types';

export function canPublishTranslation<TDocument>(snapshot: ReviewSnapshot<TDocument>): boolean {
  return snapshot.reviewedDocument !== null;
}

export function selectTranslationForPublicRead<TDocument>(
  snapshot: TranslationSnapshots<TDocument>,
): TDocument | null {
  return snapshot.publishedDocument;
}
