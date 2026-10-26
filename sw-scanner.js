const CACHE_NAME = 'scanner-cache-v1';
const ASSETS = [
  './',
  './scanner.html',
  './manifest-scanner.json',
  './1.json',
  './2.json',
  'https://cdn-icons-png.flaticon.com/512/1170/1170678.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.map((key) => { if (key !== CACHE_NAME) return caches.delete(key); })
  )));
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
