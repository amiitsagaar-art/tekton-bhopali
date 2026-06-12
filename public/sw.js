const CACHE_NAME = "tekton-cache-v2";
const urlsToCache = [
  "/",
  "/manifest.json",
  "/partner-manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.allSettled(
          urlsToCache.map((url) => {
            return cache.add(url).catch((err) => {
              console.warn("Failed to cache: " + url, err);
            });
          })
        );
      })
  );
});

self.addEventListener("fetch", (event) => {
  // Network first, falling back to cache
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
