// Simple offline cache for Çiğ Köfteci Mahsum Usta (GitHub Pages friendly)
// bump cache version to ensure clients receive the latest index.html sync fixes
const CACHE = "mahsum-usta-v8";
const ASSETS = ["./", "./index.html", "./sw.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : Promise.resolve())));
      } catch (e) {}
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only cache same-origin requests (do NOT cache Google APIs / Sheets)
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then((hit) => {
      return (
        hit ||
        fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
            return res;
          })
          .catch(() => hit)
      );
    })
  );
});
