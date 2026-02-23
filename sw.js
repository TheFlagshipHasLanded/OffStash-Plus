// OffStash+ Service Worker
// Cache-first strategy with auto-update on new deploy

const CACHE_NAME = 'offstash-v2';
const SHELL_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.svg',
  './icon-512.svg',
  'https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Space+Grotesk:wght@300;400;500;600;700&display=swap'
];

// INSTALL — cache everything, skip waiting immediately
self.addEventListener('install', event => {
  console.log('[SW] Installing v2…');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(SHELL_URLS.map(url => cache.add(url).catch(() => null)));
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATE — delete ALL old caches, claim clients immediately
self.addEventListener('activate', event => {
  console.log('[SW] Activating v2…');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k);
      }))
    ).then(() => self.clients.claim())
     .then(() => {
       // Tell all open tabs to reload so they get the new version
       return self.clients.matchAll({ type: 'window' }).then(clients => {
         clients.forEach(client => client.postMessage({ type: 'SW_UPDATED' }));
       });
     })
  );
});

// FETCH — network first for HTML (always fresh), cache first for assets
self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;
  if (request.url.startsWith('chrome-extension://')) return;

  // For HTML navigation — try network first so updates are picked up
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, toCache));
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // For everything else — cache first, network fallback
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') return response;
        const toCache = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, toCache));
        return response;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});
