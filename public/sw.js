const CACHE_NAME = 'portfolio-generate-shell-v3';
const PRECACHE_URLS = [
  '/offline',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
];

const isStaticAsset = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith('/_next/static/') || PRECACHE_URLS.includes(url.pathname));

const isPublicPlatformPage = (request, url) =>
  request.mode === 'navigate' &&
  url.origin === self.location.origin &&
  (url.pathname === '/' || url.pathname === '/offline' || url.pathname.startsWith('/guides/'));

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  // Only this origin may drive the worker's lifecycle; a message from any other
  // origin is not ours to act on.
  if (event.origin !== '' && event.origin !== self.location.origin) return;
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached ?? fetch(event.request).then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, response.clone());
          }
          return response;
        }),
      ),
    );
    return;
  }

  if (!isPublicPlatformPage(event.request, url)) return;

  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(event.request, response.clone());
        }
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match('/offline'))),
  );
});
