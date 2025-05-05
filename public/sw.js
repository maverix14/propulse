// Cache version - change this when deploying new app versions to invalidate old cache
const CACHE_VERSION = 'project-pulse-v6'; // Incremented version
const CACHE_DISPLAY_THRESHOLD = 60 * 60 * 1000; // 1 hour between update notifications
const UPDATE_CHECK_INTERVAL = 12 * 60 * 60 * 1000; // Increased to 12 hours between update checks

// Keep track of when we last showed an update notification - store in indexedDB instead of memory
const DB_NAME = 'service-worker-state';
const STORE_NAME = 'timestamps';
const LAST_UPDATE_NOTIFICATION_KEY = 'lastUpdateNotification';
const LAST_UPDATE_CHECK_KEY = 'lastUpdateCheck';

// Open the database
const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = (event) => {
      reject('Error opening database');
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
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
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      
      request.onerror = (event) => {
        resolve(defaultValue);
      };
      
      request.onsuccess = (event) => {
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
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(value, key);
      
      request.onerror = (event) => {
        reject('Error storing value');
      };
      
      request.onsuccess = (event) => {
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

// Handle messages from the client
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
        // Reset stored timestamps
        await setValue(LAST_UPDATE_NOTIFICATION_KEY, 0);
        await setValue(LAST_UPDATE_CHECK_KEY, 0);
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
  } else if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
    // Check if enough time has passed since last notification
    const now = Date.now();
    
    // Get timestamps from IndexedDB
    const lastUpdateCheck = await getValue(LAST_UPDATE_CHECK_KEY, 0);
    
    // Check if we recently checked for updates
    if (now - lastUpdateCheck < UPDATE_CHECK_INTERVAL) {
      event.ports[0].postMessage({ 
        result: 'check-throttled' 
      });
      return;
    }
    
    // Update last check timestamp
    await setValue(LAST_UPDATE_CHECK_KEY, now);
    
    // Compare cache version with current version
    const storedVersion = await getValue('cacheVersion', '');
    if (storedVersion !== CACHE_VERSION) {
      // Version mismatch - update available
      const lastNotification = await getValue(LAST_UPDATE_NOTIFICATION_KEY, 0);
      
      // Check if enough time has passed since the last notification
      if (now - lastNotification > CACHE_DISPLAY_THRESHOLD) {
        await setValue(LAST_UPDATE_NOTIFICATION_KEY, now);
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
    } else {
      // Same version - no update
      event.ports[0].postMessage({ 
        result: 'no-update' 
      });
    }
  } else if (event.data && event.data.type === 'CHECK_VERSION') {
    // New message type to just check if an update is available without notifications
    const now = Date.now();
    const lastUpdateCheck = await getValue(LAST_UPDATE_CHECK_KEY, 0);
    
    // Check if we recently checked for updates
    if (now - lastUpdateCheck < UPDATE_CHECK_INTERVAL) {
      event.ports[0].postMessage({ 
        result: 'no-update' 
      });
      return;
    }
    
    await setValue(LAST_UPDATE_CHECK_KEY, now);
    
    // Compare cache version with current version
    const storedVersion = await getValue('cacheVersion', '');
    if (storedVersion !== CACHE_VERSION) {
      event.ports[0].postMessage({ 
        result: 'update-available' 
      });
    } else {
      event.ports[0].postMessage({ 
        result: 'no-update' 
      });
    }
  }
});
