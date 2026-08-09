const CACHE_NAME = 'portfolio-generate-shell-v1';
const PRECACHE_URLS = ['/offline', '/manifest.webmanifest', '/icon.svg'];

const isStaticAsset = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.startsWith('/_next/static/') || url.pathname === '/icon.svg');

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
  if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(event.request).then((cached) =>
        cached ?? fetch(event.request).then((response) => {
          if (response.ok) void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
          return response;
        }),
      ),
    );
    return;
  }

  if (!isPublicPlatformPage(event.request, url)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) void caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached ?? caches.match('/offline'))),
  );
});

