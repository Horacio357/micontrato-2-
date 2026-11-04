const CACHE_NAME = 'micontrato-v4';
const STATIC_CACHE = 'micontrato-static-v4';

// No precachear index.html para evitar desincronización de hashes con nuevos deploys
const PRECACHE_URLS = [];

// ─── Install: pre-cachea el shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// ─── Activate: elimina caches viejos ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE)
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch strategy ──────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptamos GET
  if (request.method !== 'GET') return;

  // API calls y datos sensibles → NUNCA interceptar ni cachear por seguridad y privacidad (Ley 25.326)
  if (url.hostname.includes('base44') || url.pathname.startsWith('/api/')) {
    return;
  }

  // Fuentes de Google → Cache-first (immutable)
  if (url.hostname.includes('fonts.g')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Assets estáticos con hash (JS, CSS, imágenes) → Cache-first
  if (
    url.pathname.match(/\.(js|css|woff2?|png|jpg|jpeg|svg|ico|webp)$/)
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Navegación (HTML) → Network-first: siempre pide la versión más reciente del servidor
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error('offline and not cached');
  }
}
