import type { PortfolioDocument } from '@/modules/portfolio-document';

import type { AnyCollectionItem, IdentifiedCollectionKey } from './collection-edit.types';

export interface CollectionManagerProps {
  readonly document: PortfolioDocument;
  readonly onChange: (document: PortfolioDocument) => void;
}

export interface CollectionEntryProps extends CollectionManagerProps {
  readonly collectionKey: IdentifiedCollectionKey;
  readonly item: AnyCollectionItem;
  readonly index: number;
}
