// Service Worker：App 壳缓存（离线可用 + 可「添加到主屏幕」）
const CACHE = 'shirenbo-pwa-v1';
const BASE = '/shirenbo';
const APP_SHELL = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/manifest.json',
  BASE + '/icons/icon-96.png',
  BASE + '/icons/icon-144.png',
  BASE + '/icons/icon-192.png',
  BASE + '/icons/icon-512.png',
  BASE + '/icons/maskable-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 导航请求：network-first，失败回退缓存的 index.html（离线可开）
// 静态资源：cache-first，同时后台更新
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(BASE + '/index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(BASE + '/index.html').then(r => r || caches.match(BASE + '/')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // 后台更新
        fetch(req).then(res => caches.open(CACHE).then(c => c.put(req, res.clone()))).catch(() => {});
        return cached;
      }
      return fetch(req).then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
