const CACHE = "mahsum-usta-v6";
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(["./"])).catch(()=>{}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if(req.method !== "GET") return;
  const url = new URL(req.url);
  // sadece aynı origin cache'lensin (sheets.googleapis.com cache'lenmesin)
  if(url.origin !== self.location.origin) return;

  e.respondWith(
    caches.match(req).then((hit) => {
      return hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(()=>{});
        return res;
      }).catch(()=>hit);
    })
  );
});
