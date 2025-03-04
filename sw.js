
const CACHE_NAME = 'tictactoe-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/sw-register.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/logo.svg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://assets.mixkit.co/sfx/preview/mixkit-simple-countdown-922.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-negative-guitar-tone-2324.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-unlock-game-notification-253.mp3',
  'https://assets.mixkit.co/sfx/preview/mixkit-game-level-music-689.mp3'
];

// Install event - cache assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Add to cache
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      }).catch(() => {
        // If both cache and network fail, show a generic fallback
        return new Response('Network and cache error occurred');
      })
  );
});
