
// Cache version - change this whenever assets change to force update
const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `tictactoe-cache-${CACHE_VERSION}`;

// Assets to cache for offline use
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/images/logo.svg',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/sounds/background.mp3',
  '/sounds/click.mp3',
  '/sounds/lose.mp3',
  '/sounds/tie.mp3',
  '/sounds/win.mp3',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event - cache all initial assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Force new service worker to become active
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          // Delete old version caches
          return cacheName.startsWith('tictactoe-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Deleting old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Tell clients about the update
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'CACHE_UPDATED',
            version: CACHE_VERSION
          });
        });
      });
      return self.clients.claim(); // Take control of all clients
    })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.startsWith('https://cdnjs.cloudflare.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return the response
        if (response) {
          return response;
        }

        // Clone the request because it's a one-time use stream
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            // Don't cache non-successful responses or non-basic types
            if (event.request.url.includes('cdnjs.cloudflare.com')) {
              // Special case for Font Awesome
              if (response) return response;
            }
            return response;
          }

          // Clone the response because it's a one-time use stream
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return response;
        }).catch(() => {
          // If fetch fails (e.g., offline), try to serve default assets
          if (event.request.url.includes('.mp3')) {
            // For audio files, serve a silent fallback
            return new Response(null, { status: 200, headers: { 'Content-Type': 'audio/mp3' } });
          }
        });
      })
  );
});

// Push event - handle push notifications
self.addEventListener('push', event => {
  let data = { title: 'Tic-Tac-Toe', body: 'Come back and play a game!' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      // If not JSON, use as text
      data.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/images/icon-192.png',
      badge: '/images/icon-192.png',
      vibrate: [100, 50, 100]
    })
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'}).then(clientsArr => {
      // If a window tab is already open, focus it
      const hadWindowToFocus = clientsArr.some(windowClient => {
        if (windowClient.url === '/' && 'focus' in windowClient) {
          return windowClient.focus(), true;
        }
        return false;
      });

      // Otherwise open a new tab
      if (!hadWindowToFocus) {
        clients.openWindow('/').then(windowClient => {
          if (windowClient) windowClient.focus();
        });
      }
    })
  );
});

// Message event - handle messages from clients
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
