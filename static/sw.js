// ==============================================================================
// SERVICE WORKER FOR SARAH OGEMBO PERSONAL BRAND (PWA)
// Cache Version 2: Offline Resilience, Font Caching & Stale-While-Revalidate
// ==============================================================================

const CACHE_NAME = 'sarah-ogembo-v2';
const OFFLINE_URL = '/offline.html';

const PRECACHE_ASSETS = [
  '/',
  '/cv/',
  '/blog/',
  '/offline.html',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
  '/images/logos/logo-so-crest.png',
  '/images/logos/logo-so-crest.webp',
  '/images/hero-sarah-transparent.webp',
  '/images/about-sarah.webp',
  '/images/portrait-executive.webp'
];

// Install: Pre-cache essential app shell and offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[PWA] Pre-cache non-fatal warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA] Removing obsolete cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategy based on request mode
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const request = event.request;
  const url = new URL(request.url);

  // 1. HTML Navigation Requests (Network First, Cache Fallback, Offline Page)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // 2. Google Fonts & Static Assets (Stale-While-Revalidate)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com' || url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => {
            // Silently swallow fetch failure when offline
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. Default Fetch
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request);
    })
  );
});
