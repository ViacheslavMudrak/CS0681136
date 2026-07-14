/**
 * Minimum-viable PWA service worker.
 * Required so browsers surface the "Add to Home Screen" install prompt.
 * Intentionally a no-op on fetch — ISR pages stay fresh via the network.
 */
self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function () {
  // no-op
});
