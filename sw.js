const CACHE_NAME = 'orders-cache-v2'; // Изменил версию, чтобы телефон понял, что файл обновился
const ASSETS = [
  './',
  './index.html',
  './Revision.html', // <--- ДОБАВЛЕНО: Теперь заказы кэшируются
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/1170/1170678.png'
];

// Установка: кэшируем файлы
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация: чистим старый кэш
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => { 
          if (key !== CACHE_NAME) return caches.delete(key); 
      })
    ))
  );
});

// Перехват запросов: если сеть есть — берем из сети, если нет — из кэша
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  
  // Не кэшируем запросы к Firebase (базе данных)
  if (e.request.url.includes('firestore.googleapis.com') || e.request.url.includes('googleapis.com')) {
      return; 
  }

  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
