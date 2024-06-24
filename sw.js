const version = 1;
const cacheName = `pwa-app-project-${version}`; // general app cache
const movieCacheName = `movies-pwa-project-${version}`; // cache for specific movie

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
    "./img/icons/ion_close.svg",
    "./img/icons/ion_heart.svg",
    "./img/icons/ion_menu.svg",
    "./img/icons/ion_person.svg",
    "./img/icons/ion_search.svg",
];

// self.isOnline = "onLine" in navigator?.onLine;

self.addEventListener("install", (ev) => {
    console.log("SW install event");

    // pre-cache web resources
    ev.waitUntil(
        (async () => {
            try {
                staticFileCache = await caches.open(cacheName);
                await staticFileCache.addAll(preCacheResources);
            } catch (err) {
                console.error(err);
            }
        })()
    );
});

self.addEventListener("activate", (ev) => {
    console.log("Service worker activated");

    // Delete old cache versions
    ev.waitUntil(
        (async () => {
            const keys = await caches.keys();

            await Promise.all(
                keys
                    .filter(
                        (key) => key !== cacheName && key !== movieCacheName
                    )
                    .map((key) => caches.delete(key))
            );
        })()
    );
});

self.addEventListener("fetch", (ev) => {
    const req = new Request(ev.request);
    console.log(req);

    // console.log(req.url.pathname);

    // 1 - REPLACE SEARCH-RESULTS WITH CACHE-RESULTS (FETCH EV FOR PAGE GETS REPLACED)
    // if (req.url) {

    // }

    // 2 - SAVE ALL IMAGES ON SEARCH-RESULTS PAGE TO cacheName
    if (req.url.includes("image.tmdb") && req.url.includes("/t/p/w92")) {
        ev.respondWith(
            (async () => {
                const cacheResponse = await caches.match(req);

                if (cacheResponse) {
                    console.log(`Cache hit for ${req.url}`);
                    return cacheResponse;
                }

                const networkResponse = await fetch(req);

                const cache = await caches.open(cacheName);
                cache.put(req, networkResponse.clone());

                return networkResponse;
            })()
        );
    }

    // 3 - if fetch is from render, then save details to movieCacheName
    if (req.url.includes("/movies/")) {
        ev.respondWith(
            (async () => {
                const cacheResponse = await caches.match(req);

                if (cacheResponse) {
                    console.log(`Cache hit for ${req.url}`);
                    return cacheResponse;
                }

                const networkResponse = await fetch(req);

                const cache = await caches.open(movieCacheName);
                cache.put(req, networkResponse.clone());

                return networkResponse;
            })()
        );
    }
});

self.addEventListener("online", (ev) => {
    console.log("SW is online");
    self.isOnline = true;
});

self.addEventListener("offline", (ev) => {
    console.log("SW is offline");
    self.isOffline = false;
});
