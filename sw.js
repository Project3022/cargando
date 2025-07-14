const CACHE_NAME = 'markeshop-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icono-192.png',
  '/icono-512.png'
];

// Instalar: guardar archivos en caché
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE);
    }).catch(err => {
      console.error('❌ Error al cachear archivos:', err);
    })
  );
});

// Activar: limpiar cachés antiguos si hay una nueva versión
self.addEventListener('activate', event => {
  const cacheAllowlist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (!cacheAllowlist.includes(name)) {
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// Interceptar solicitudes: usar caché si existe
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(respuestaCache => {
      return respuestaCache || fetch(event.request);
    })
  );
});
