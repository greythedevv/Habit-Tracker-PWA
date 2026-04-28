const CACHE_NAME = 'habit-tracker-v1';

const APP_SHELL = [
  '/',
  '/login',
  '/signup',
  '/dashboard',
  '/manifest.json',
];

// INSTALL — cache app shell immediately
self.addEventListener('install', (event) => {
  // Take over immediately without waiting for old SW to die
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
});

// ACTIVATE — delete ALL old caches, take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Delete every cache that isn't the current version
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      ),
      // Take control of all open tabs immediately
      self.clients.claim(),
    ])
  );
});

// FETCH — network first, fall back to cache
// Network-first means users always get fresh content when online
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Got a good response — update the cache
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network failed — serve from cache (offline support)
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // If nothing in cache either, return a basic offline response
          return new Response('App is offline. Please reconnect.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        });
      })
  );
});