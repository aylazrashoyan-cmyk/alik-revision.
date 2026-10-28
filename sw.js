const CACHE_NAME = 'orders-cache-v4';  // ⚠️ ОБЯЗАТЕЛЬНО поднять версию!

// Кэшируем ТОЛЬКО локальные файлы. Внешние CDN — НЕ кэшируем.
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .catch((err) => console.warn('SW: cache.addAll failed', err))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())  // ← ВАЖНО: забираем контроль
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // ⚠️ НЕ перехватываем Firebase, gstatic, Google API
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firebase') ||
    e.request.method !== 'GET'
  ) {
    return;  // пусть идёт напрямую в сеть, без SW
  }

  // Локальные файлы: сначала кэш, потом сеть (cache-first)
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((response) => {
          // кэшируем успешные ответы локальных ресурсов
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Всё остальное (flaticon и т.п.) — просто в сеть
  // ничего не делаем — браузер сам загрузит
});
