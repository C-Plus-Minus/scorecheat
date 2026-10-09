const CACHE_NAME = 'score-editor-v1';
const urlsToCache = [
    '/',
    'index.html',
    'style.css',
    'manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js'
];

// Install event: Cache core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting(); // Force clients to use the new service worker immediately
});

// Fetch event: Serve assets from cache first (Network fallback)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return the cached response
                if (response) {
                    return response;
                }
                // Cache miss - fetch from network
                return fetch(event.request);
            })
            .catch(() => {
                // Handle network failure if needed
                return new Response("<h1>Offline</h1><p>Please check your network connection.</p>", {status: 503});
            })
    );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
