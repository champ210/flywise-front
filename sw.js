// sw.js
const APP_CACHE_NAME = 'flywise-ai-app-cache-v1';
const MAP_TILES_CACHE_NAME = 'flywise-ai-map-tiles-cache-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
];

// On install, cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [APP_CACHE_NAME, MAP_TILES_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Cache-first strategy for map tiles
  if (url.hostname.endsWith('tile.openstreetmap.org')) {
    event.respondWith(
      caches.open(MAP_TILES_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          if (response) {
            return response; // Found in cache
          }
          // Not in cache, fetch and cache
          return fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
                cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
  } else {
    // Stale-while-revalidate for everything else
    event.respondWith(
      caches.open(APP_CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // This catch is important for offline fallback
            // If fetch fails, and we had a cached response, it's already been returned.
            // If fetch fails and there was no cached response, the promise rejects, and the user sees the browser's offline page.
          });
          return response || fetchPromise;
        });
      })
    );
  }
});
