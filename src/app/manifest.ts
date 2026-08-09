import type { MetadataRoute } from 'next';

import { I18N_NAMESPACES } from '@/packages/i18n';
import { getServerTranslations } from '@/packages/i18n/server';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getServerTranslations(I18N_NAMESPACES.app);

  return {
    name: t('name'),
    short_name: t('name'),
    description: t('tagline'),
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f8fa',
    theme_color: '#2258d8',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
