
const CACHE_NAME = 'tictactoe-cache-v3';
const APP_SHELL = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/sw-register.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/logo.svg',
  '/sounds/click.mp3',
  '/sounds/win.mp3',
  '/sounds/lose.mp3',
  '/sounds/tie.mp3',
  '/sounds/background.mp3',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Installing new version');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => {
        console.log('[ServiceWorker] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activating new version');
  event.waitUntil(
    Promise.all([
      // Clean up old version caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName !== CACHE_NAME;
          }).map(cacheName => {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ])
  );
});

// Network-first strategy with cache fallback
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('cdnjs.cloudflare.com')) {
    return;
  }
  
  // For HTML requests - always go to network first
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept').includes('text/html'))) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request).then(cachedResponse => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }
  
  // For non-HTML requests (assets, API calls)
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Don't cache if response is not valid
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Cache a clone of the response
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request).then(cachedResponse => {
          return cachedResponse || new Response('Network and cache error occurred');
        });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
