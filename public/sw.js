/* Purple Sector PWA service worker.
 * Intentionally does not cache pages or API responses, so live F1 data
 * and existing navigation behavior are not changed by stale cached content.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
