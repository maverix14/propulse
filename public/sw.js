// Cache version - change this when deploying new app versions to invalidate old cache
const CACHE_VERSION = 'project-pulse-v4';
const CACHE_DISPLAY_THRESHOLD = 60 * 1000; // 1 minute between update notifications

// Keep track of when we last showed an update notification
self._lastUpdateNotification = 0;

self.addEventListener('install', (event) => {
  console.log('Service Worker installing with cache version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/favicon.ico',
        '/icons/icon-192x192.png',
        '/icons/icon-512x512.png'
      ]);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // For navigation requests (HTML pages), always fetch from network first
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then(response => {
          return response || caches.match('/');
        });
      })
    );
    return;
  }
  
  // Check for version.json to bust cache when version changes
  if (event.request.url.includes('manifest.json')) {
    event.respondWith(
      fetch(event.request).then(response => {
        return response;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      
      // Clone the request because it's a one-time use stream
      const fetchRequest = event.request.clone();
      
      return fetch(fetchRequest).then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response because it's a one-time use stream
        const responseToCache = response.clone();
        
        caches.open(CACHE_VERSION).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // If both cache and network fail, return the offline page
        return caches.match('/');
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating with cache version:', CACHE_VERSION);
  // Delete old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            console.log('Service Worker: clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: claiming clients');
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('All caches cleared');
        event.ports[0].postMessage({ 
          result: 'Cache cleared successfully' 
        });
      }).catch(error => {
        console.error('Error clearing cache:', error);
        event.ports[0].postMessage({ 
          error: 'Failed to clear cache' 
        });
      })
    );
  } else if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
    // Check if enough time has passed since last notification
    const now = Date.now();
    if (now - self._lastUpdateNotification > CACHE_DISPLAY_THRESHOLD) {
      self._lastUpdateNotification = now;
      // Only respond if we haven't notified recently
      event.ports[0].postMessage({ 
        result: 'update-available' 
      });
    } else {
      // Too soon for another notification
      event.ports[0].postMessage({ 
        result: 'notification-throttled' 
      });
    }
  }
});
