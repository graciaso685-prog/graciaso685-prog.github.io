// Studiom : met le site en cache pour qu'il s'ouvre même hors connexion.
// Ne touche pas au jeu Glimmer Maze (/glimmer-maze/) ni aux pages légales de Merge it, qui ont leurs propres règles.
const CACHE = 'studiom-v4';
const FILES = ['/', '/site-texts.js', '/studiom-fb.js', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/maskable-512.png', '/icons/apple-touch-icon.png', '/icons/favicon-48.png', '/brand/logo-s.webp', '/brand/logo-studiom.webp',
  '/glimmer-maze/icons/icon-192.png', '/glimmer-maze/icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('studiom-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Polices Google : cache, mises à jour en arrière-plan
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // Page d'accueil : réseau d'abord (dernière version), cache si hors connexion
  if (req.mode === 'navigate' && (url.pathname === '/' || url.pathname === '/index.html')) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put('/', copy)); return r; }).catch(() => caches.match('/')));
    return;
  }
  // Configuration Firebase : toujours la dernière version (pas de cache)
  if (url.pathname === '/firebase-config.js') return;
  // Textes, icônes et manifeste : réseau d'abord pour les scripts, cache d'abord pour le reste
  if (url.pathname === '/site-texts.js' || url.pathname === '/studiom-fb.js') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; }).catch(() => caches.match(req)));
    return;
  }
  // Icônes et manifeste : cache d'abord
  if (FILES.includes(url.pathname)) e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
