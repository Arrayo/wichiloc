const CACHE_NAME = 'gpx-app-v2';
const TILE_CACHE = 'map-tiles-v1';

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

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  
  // Cachear tiles de mapas
  if (url.hostname.includes('tile.openstreetmap') || 
      url.hostname.includes('arcgisonline.com')) {
    e.respondWith(
      caches.open(TILE_CACHE).then((cache) => {
        return cache.match(e.request).then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(e.request).then((networkResponse) => {
            // Solo cachear respuestas exitosas
            if (networkResponse && networkResponse.status === 200) {
              cache.put(e.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => {
            // Si falla la red, devolver tile en blanco
            return new Response('', { status: 503 });
          });
        });
      })
    );
    return;
  }
  
  // Para otros recursos, cache-first
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
