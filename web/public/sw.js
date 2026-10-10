// Dardasha Service Worker (v2 - Cache Invalidation Shield)
const CACHE_NAME = 'dardasha-cache-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('Purging legacy cache:', key);
          return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always fetch fresh network first, fallback to cache only offline
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
