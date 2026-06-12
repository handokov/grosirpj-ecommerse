/// <reference lib="webworker" />

// CACHE_VERSION — increment this number with each deployment to force cache refresh
// This ensures users always get the latest version after a deploy
const CACHE_VERSION = 2;
const CACHE_NAME = `grosirpj-v${CACHE_VERSION}`;
const OFFLINE_URL = "/";

// Only precache truly static, essential resources (NOT pages)
const PRECACHE_URLS = [
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/logo-sm.png",
  "/logo.png",
];

// Install event — precache essential static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use allSettled so one failure doesn't block the entire SW
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn("Failed to precache:", url, err);
          })
        )
      );
    })
  );
  // Activate immediately without waiting for existing tabs to close
  self.skipWaiting();
});

// Activate event — clean up ALL old caches from previous versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log("Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Fetch event — smart caching strategy
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip API calls — always fresh from server
  if (url.pathname.startsWith("/api/")) return;

  // Skip Chrome extensions and non-http requests
  if (url.origin !== self.location.origin || !url.protocol.startsWith("http")) return;

  // Skip Next.js hot reload and dev requests
  if (url.pathname.startsWith("/_next/") && url.pathname.includes("hmr")) return;

  // STRATEGY 1: Navigation requests (HTML pages) — NETWORK FIRST
  // This prevents stale cached broken pages from being served
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            // Cache the successful response for offline fallback
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed — try cache, then offline page
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // STRATEGY 2: Static assets (_next/static/) — CACHE FIRST with background update
  // These have hashed filenames so they're always unique per build
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // STRATEGY 3: Other resources (images, etc.) — STALE WHILE REVALIDATE
  // Return cache immediately if available, but update in background
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response);
            });
          }
          return response;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
