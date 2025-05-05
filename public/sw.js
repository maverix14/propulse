// Cache version - keep this consistent to avoid unnecessary cache purges
const CACHE_VERSION = 'project-pulse-v6';

// Open the database
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('service-worker-state', 1);
    
    request.onerror = () => {
      reject('Error opening database');
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('timestamps')) {
        db.createObjectStore('timestamps');
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

// Get a value from the database
const getValue = async (key, defaultValue) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction('timestamps', 'readonly');
      const store = transaction.objectStore('timestamps');
      const request = store.get(key);
      
      request.onerror = () => {
        resolve(defaultValue);
      };
      
      request.onsuccess = () => {
        resolve(request.result || defaultValue);
      };
    });
  } catch (error) {
    return defaultValue;
  }
};

// Set a value in the database
const setValue = async (key, value) => {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('timestamps', 'readwrite');
      const store = transaction.objectStore('timestamps');
      const request = store.put(value, key);
      
      request.onerror = () => {
        reject('Error storing value');
      };
      
      request.onsuccess = () => {
        resolve();
      };
    });
  } catch (error) {
    console.error('Error setting value:', error);
  }
};

// Initialize the cache version in storage
const initCache = async () => {
  try {
    await setValue('cacheVersion', CACHE_VERSION);
  } catch (error) {
    console.error('Failed to initialize cache version:', error);
  }
};

self.addEventListener('install', (event) => {
  console.log('Service Worker installing with cache version:', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_VERSION).then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/manifest.json',
          '/favicon.ico',
          '/icons/icon-192x192.png',
          '/icons/icon-512x512.png'
        ]);
      }),
      initCache()
    ])
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
      setValue('cacheVersion', CACHE_VERSION);
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Handle messages from the client - only keep essential functionality
self.addEventListener('message', async (event) => {
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
      }).then(async () => {
        console.log('All caches cleared');
        await setValue('cacheVersion', CACHE_VERSION);
        
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
  }
});
