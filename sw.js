const CACHE_NAME = 'gpx-app-v2';
const TILE_CACHE = 'map-tiles-v1';
const MAX_TILES = 500;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== TILE_CACHE) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

const trimTileCache = async (cache) => {
  const keys = await cache.keys();
  if (keys.length > MAX_TILES) {
    const toDelete = keys.slice(0, keys.length - MAX_TILES);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
};

// Pre-cache tiles sent from the app when a route is loaded
self.addEventListener('message', (e) => {
  if (e.data?.type !== 'PRECACHE_TILES') return;

  const { urls } = e.data;

  caches.open(TILE_CACHE).then(async (cache) => {
    for (const url of urls) {
      const existing = await cache.match(url);
      if (existing) continue;

      try {
        const response = await fetch(url);
        if (response && response.status === 200) {
          await cache.put(url, response);
        }
      } catch (_) {
        // Offline or tile unavailable — skip silently
      }

      // Throttle to avoid saturating the connection (~20 tiles/s)
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    await trimTileCache(cache);
  });
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  if (url.hostname.includes('tile.openstreetmap') ||
      url.hostname.includes('arcgisonline.com')) {
    e.respondWith(
      caches.open(TILE_CACHE).then((cache) => {
        return cache.match(e.request).then((response) => {
          if (response) return response;

          return fetch(e.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(e.request, networkResponse.clone());
              trimTileCache(cache);
            }
            return networkResponse;
          }).catch(() => new Response('', { status: 503 }));
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (e.request.method === 'GET') {
            cache.put(e.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});
