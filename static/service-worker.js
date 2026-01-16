// Service Worker for PWA offline support
const CACHE_NAME = 'atlas-of-skills-v1';
const RUNTIME_CACHE = 'atlas-runtime-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
	'/',
	'/headshot.jpg',
	'/kevin-riehl-resume.pdf',
	'/robots.txt',
	// Add icon paths when they're created
	'/icons/pwa.svg'
];

// Install event - precache critical assets
self.addEventListener('install', (event) => {
	console.log('[Service Worker] Installing...');
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => {
				console.log('[Service Worker] Precaching assets');
				return cache.addAll(PRECACHE_ASSETS);
			})
			.then(() => self.skipWaiting())
	);
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
	console.log('[Service Worker] Activating...');
	event.waitUntil(
		caches.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames
						.filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
						.map((name) => {
							console.log('[Service Worker] Deleting old cache:', name);
							return caches.delete(name);
						})
				);
			})
			.then(() => self.clients.claim())
	);
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
	// Skip cross-origin requests
	if (!event.request.url.startsWith(self.location.origin)) {
		return;
	}

	// Network first strategy for HTML
	if (event.request.mode === 'navigate') {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					// Clone response to store in cache
					const responseClone = response.clone();
					caches.open(RUNTIME_CACHE)
						.then((cache) => cache.put(event.request, responseClone));
					return response;
				})
				.catch(() => {
					// Fallback to cache if network fails
					return caches.match(event.request)
						.then((cachedResponse) => {
							if (cachedResponse) {
								return cachedResponse;
							}
							// Return offline page if available
							return caches.match('/');
						});
				})
		);
		return;
	}

	// Cache first strategy for assets (CSS, JS, images, icons)
	event.respondWith(
		caches.match(event.request)
			.then((cachedResponse) => {
				if (cachedResponse) {
					return cachedResponse;
				}

				// Not in cache, fetch from network
				return fetch(event.request)
					.then((response) => {
						// Don't cache if not a success response
						if (!response || response.status !== 200 || response.type === 'error') {
							return response;
						}

						// Clone response to store in cache
						const responseClone = response.clone();

						caches.open(RUNTIME_CACHE)
							.then((cache) => {
								cache.put(event.request, responseClone);
							});

						return response;
					})
					.catch(() => {
						// Return fallback for images if network and cache fail
						if (event.request.destination === 'image') {
							return new Response(
								'<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#05050a"/><text x="50%" y="50%" text-anchor="middle" fill="#ffd700">Offline</text></svg>',
								{ headers: { 'Content-Type': 'image/svg+xml' } }
							);
						}
					});
			})
	);
});

// Message event - allow clients to skip waiting
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}
});
