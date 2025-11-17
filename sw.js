const CACHE_NAME = "suivi-montres-colis-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Installation : mise en cache des fichiers essentiels
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activation : nettoyage des anciens caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
});

// Stratégie de fetch : Cache d’abord, réseau ensuite
self.addEventListener("fetch", (event) => {
  const request = event.request;

  // On n'intercepte que les GET
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      // Si on a la ressource en cache → renvoi
      if (cached) return cached;

      // Sinon → tentative réseau
      return fetch(request)
        .then((response) => {
          // On met en cache la ressource récupérée si possible
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => cached); // fallback si offline
    })
  );
});
