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
    // const reqURL = new URL(ev.request.url);
    // console.log(`Fetching ${reqURL.pathname}`);
    // handle requests for movie details
    // if (reqURL.pathname.includes("")) {
    //     ev.respondWith(
    //         (async () => {
    //             try {
    //                 const cache = await caches.open(movieCacheName);
    //                 const cachedResponse = await cache.match(ev.request);
    //                 if (cachedResponse) {
    //                     console.log("Serving from cache", reqURL.pathname);
    //                     return cachedResponse;
    //                 }
    //                 const response = await fetch(ev.request);
    //                 cache.put(ev.request, response.clone());
    //                 return response;
    //             } catch (err) {
    //                 console.error(err);
    //             }
    //         })()
    //     );
    // }
});

// self.addEventListener("fetch", (ev) => {
// console.log(ev.request);
// const reqURL = new URL(ev.request.url);
// console.log(`Fetching ${reqURL.pathname}`);
// handle requests for movie details
// });

self.addEventListener("online", (ev) => {
    console.log("SW is online");
    self.isOnline = true;
});

self.addEventListener("offline", (ev) => {
    console.log("SW is offline");
    self.isOffline = false;
});
