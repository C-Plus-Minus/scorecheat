const CACHE_NAME = 'pwa-minimal-cache-v1';
const urlsToCache = [
    '/',
    'index.html',
    'manifest.json',
    // Add icon paths here if they were real assets
];

// Install event: Cache the necessary files
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('[Service Worker] Cache opened');
            return cache.addAll(urlsToCache);
        })
    );
});

// Fetch event: Intercept and serve cached content first
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Cache hit - return the cached response
            if (response) {
                console.log('[Service Worker] Cache HIT:', event.request.url);
                return response;
            }
            // Cache miss - fetch from the network
            console.log('[Service Worker] Cache MISS: Fetching from network:', event.request.url);
            return fetch(event.request);
        })
        .catch(error => {
             console.error('[Service Worker] Network and Cache failed:', error);
             // Fallback if everything fails
             return new Response('You are offline and the asset is not cached.', { status: 503 });
        })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating and cleaning up old caches');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});