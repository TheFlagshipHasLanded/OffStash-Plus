// OffStash+ Service Worker
// Cache-first strategy for full offline support

const CACHE_NAME = 'offstash-v1';
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg',
  'https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Space+Grotesk:wght@300;400;500;600;700&display=swap'
];

// INSTALL — cache everything
self.addEventListener('install', event => {
  console.log('[SW] Installing OffStash+ SW…');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache shell files, ignore failures on external fonts
      return cache.addAll(SHELL_URLS).catch(err => {
        console.warn('[SW] Some cache adds failed (OK if offline during install):', err);
        // Cache what we can
        return Promise.allSettled(SHELL_URLS.map(url => cache.add(url).catch(()=>null)));
      });
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATE — clean old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// FETCH — cache-first, network fallback
self.addEventListener('fetch', event => {
  const { request } = event;

  // Skip non-GET and chrome-extension
  if (request.method !== 'GET') return;
  if (request.url.startsWith('chrome-extension://')) return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, toCache));
        return response;
      }).catch(() => {
        // Network failed — return offline fallback for navigation
        if (request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
