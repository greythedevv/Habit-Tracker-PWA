const CACHE_NAME = 'habit-tracker-v2';

const APP_SHELL = [
  '/',
  '/login',
  '/signup',
  '/dashboard',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Don't fail install if some resources can't be cached
      return Promise.allSettled(
        APP_SHELL.map((url) => cache.add(url).catch(() => {}))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      ),
      self.clients.claim(),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          // Return a minimal HTML shell so body is never empty
          return new Response(
            `<!DOCTYPE html>
            <html>
              <head><title>Habit Tracker</title></head>
              <body>
                <div id="offline-shell">
                  <h1>Habit Tracker</h1>
                  <p>You are offline. Please reconnect to continue.</p>
                </div>
              </body>
            </html>`,
            {
              status: 200,
              headers: { 'Content-Type': 'text/html' },
            }
          );
        });
      })
  );
});

// Listen for skip waiting message from the page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});