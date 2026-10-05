// Bump VERSION to drop every old cache on the next visit.
const VERSION = "sous-v5";
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", (event) => {
  // "/" is cached up front so the very first offline launch has a page to show.
  event.waitUntil(caches.open(VERSION).then((cache) => cache.add("/")));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(deleteOldCaches().then(() => self.clients.claim()));
});

async function deleteOldCaches() {
  const names = await caches.keys();
  await Promise.all(names.filter((name) => name !== VERSION).map((name) => caches.delete(name)));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
  } else if (url.origin === self.location.origin && !url.pathname.startsWith("/api/")) {
    // /api/ answers (recipe reads) are never cached here: the app saves recipes itself, and a cached error would stick.
    event.respondWith(cacheFirst(request));
  } else if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Network first so a new deploy shows up on the next open; the cached "/" only
// answers when the network fails. Sous has one page, so "/" stands in for any route.
async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(VERSION);
    cache.put("/", response.clone());
    return response;
  } catch {
    return (await caches.match("/")) ?? Response.error();
  }
}

// Vite names built files by content hash, so a cached copy is never stale.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) (await caches.open(VERSION)).put(request, response.clone());
  return response;
}

// Font files are cross-origin, so their responses may be opaque; those are still cacheable.
async function staleWhileRevalidate(request) {
  const cache = await caches.open(VERSION);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((response) => {
      if (response.ok || response.type === "opaque") cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached ?? Response.error());
  return cached ?? refresh;
}

// Tapping a use-by alert brings Sous forward, or opens it if it was closed.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows[0];
      return open ? open.focus() : self.clients.openWindow("/");
    }),
  );
});
