
const CACHE_NAME = "moku-static-v2";

const STATIC_ASSETS = [
  "/manifest.webmanifest",
  "/images/moku/brand/favicon-16x16.png",
  "/images/moku/brand/favicon-32x32.png",
  "/images/moku/brand/icon-192x192.png",
  "/images/moku/brand/icon-512x512.png",
  "/images/moku/brand/apple-touch-icon.png",
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
    (async () => {
      const cacheNames = await caches.keys();

      await Promise.all(
        cacheNames
          .filter(
            (name) =>
              name.startsWith("moku-static-") &&
              name !== CACHE_NAME
          )
          .map((name) => caches.delete(name))
      );

      await self.clients.claim();
    })()
  );
});

// Fetch Strategy
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Hanya menangani request dari origin MOKU
  if (url.origin !== self.location.origin) {
    return;
  }

  // Hanya menangani request GET
  if (request.method !== "GET") {
    return;
  }

  // Jangan intercept API, Firebase, dan Next.js
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/__/")
  ) {
    return;
  }

  // Halaman selalu mengambil versi terbaru dari server
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request, {
        cache: "no-store",
      })
    );

    return;
  }

  // Cache hanya aset yang sudah ditentukan
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request, {
            cache: "no-cache",
          });

          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);

            await cache.put(request, response.clone());
          }

          return response;
        } catch (error) {
          const cachedResponse = await caches.match(request);

          if (cachedResponse) {
            return cachedResponse;
          }

          throw error;
        }
      })()
    );
  }
});
