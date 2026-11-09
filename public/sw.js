const CACHE_NAME = "vellora-v3";
const APP_BASE = new URL("./", self.registration.scope);
const APP_ENTRY = APP_BASE.href;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll([
        APP_ENTRY,
        new URL("manifest.webmanifest", APP_BASE).href,
        new URL("vellora-icon.svg", APP_BASE).href,
      ]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("vellora-") && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === "navigate") {
        const appShell = await caches.match(APP_ENTRY);
        if (appShell) return appShell;
      }
      return Response.error();
    }),
  );
});
