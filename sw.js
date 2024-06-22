const version = 1;
const cacheName = `pwa-app-project-${version}`; // general app cache
const movieCacheName = `movies-pwa-project-${version}`; // cache for specific movie

// pre cache all resources (UNFINISHED | ADD ALL IMAGES)
const preCacheResources = [
    "./",
    "./index.html",
    "./404.html",
    "./details.html",
    "./cache-results.html",
    "./favourites.html",
    "./css/main.css",
    "./css/css-reset.css",
    "./js/main.js",
    "./img/icons/",
];

self.isOnline = "onLine" in navigator?.onLine;

self.addEventListener("install", (ev) => {
    console.log("SW install event");
    ev.waitUntil(
        caches
            .open(cacheName)
            .then((cache) => {
                return cache.addAll(preCacheResources);
            })
            .catch(console.error)
    );
});

self.addEventListener("activate", (ev) => {
    console.log("Service worker activated");
    // Delete old cache versions
    ev.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter(
                            (key) => key !== cacheName && key !== movieCacheName
                        )
                        .map((key) => caches.delete(key))
                )
            )
    );
});

self.addEventListener("online", (ev) => {
    console.log("SW is online");
    self.isOnline = true;
});

self.addEventListener("offline", (ev) => {
    console.log("SW is offline");
    self.isOffline = false;
});
