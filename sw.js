// sw.js
const CACHE_NAME = 'flywise-ai-cache-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  // The main script and css will be caught by the fetch handler.
];

// On install, cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

// On activate, clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
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

// On fetch, use a stale-while-revalidate strategy for most requests
self.addEventListener('fetch', event => {
  // We only want to cache GET requests.
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return cached response if available, and fetch an update in the background.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // If the request is successful, update the cache.
          // This will cache CDN assets as well.
          if (networkResponse.ok) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // Network fetch failed, which is expected offline. The cached response (if it exists) has already been returned.
        });

        // Return the cached response immediately if it exists, otherwise wait for the network response.
        return response || fetchPromise;
      });
    })
  );
});