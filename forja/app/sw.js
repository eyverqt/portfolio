/* Forja — service worker: abre la app sin conexión.
   · Navegación: red primero; sin red, la última página guardada.
   · Archivos de /assets (con hash en el nombre): caché primero.
   · Fuentes de Google: caché primero (la app se ve igual sin red).
   Los datos van por Firestore, que guarda en el dispositivo lo que se
   registra sin conexión y lo sube solo al volver la red. */
const CACHE = 'forja-v3';
const FUENTES = 'forja-fuentes-v1';
const BASE = new URL('./', self.location).pathname;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll([BASE, BASE + 'icono.svg', BASE + 'manifest.webmanifest'])).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== FUENTES).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.open(FUENTES).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }))));
    return;
  }
  if (url.origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put(BASE, copia));
      return r;
    }).catch(() => caches.match(BASE)));
    return;
  }

  if (url.pathname.startsWith(BASE + 'assets/')) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put(req, copia));
      return r;
    })));
  }
});
