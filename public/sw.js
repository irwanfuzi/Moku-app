const CACHE_NAME = "moku-cache-v1";

const STATIC_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/images/moku/brand/favicon-16x16.png",
  "/images/moku/brand/favicon-32x32.png",
  "/images/moku/brand/icon-192x192.png",
  "/images/moku/brand/icon-512x512.png",
  "/images/moku/brand/apple-touch-icon.png"
];

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );

  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim();
});

// Fetch Strategy
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Hanya menangani request dari origin MOKU
  if (url.origin !== self.location.origin) {
    return;
  }

  // Jangan cache request non-GET
  if (request.method !== "GET") {
    return;
  }

  // Jangan cache Firebase, API, dan request Next.js dinamis
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/__/") 
  ) {
    return;
  }

  // Navigasi halaman: network first
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedPage = await caches.match("/");
        return cachedPage || Response.error();
      })
    );

    return;
  }

  // Aset statis: cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const responseClone = networkResponse.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return networkResponse;
      });
    }) 
  );
}); 
