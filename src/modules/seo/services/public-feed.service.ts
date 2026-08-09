import { isAppLocale } from '@/modules/localization';
import {
  listPublishedPortfoliosUnscoped,
  listPublishedTranslationsUnscoped,
} from '@/modules/portfolios/server';

import { buildPortfolioFeedItems, serializeRssFeed } from '../helpers/feed.helper';

export async function getPublicRssFeed(): Promise<string> {
  const portfolios = await listPublishedPortfoliosUnscoped();
  const translations = await listPublishedTranslationsUnscoped();
  const items = buildPortfolioFeedItems(
    [
      ...portfolios.map((portfolio) => ({
        slug: portfolio.slug,
        document: portfolio.document,
        publishedAt: portfolio.publishedAt,
        locale: 'en',
      })),
      ...translations.flatMap((translation) =>
        isAppLocale(translation.locale) && translation.locale !== 'en'
          ? [{ ...translation, locale: translation.locale }]
          : [],
      ),
    ].toSorted((left, right) => right.publishedAt.getTime() - left.publishedAt.getTime()),
  );

  return serializeRssFeed(items);
}
