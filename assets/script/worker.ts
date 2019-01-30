declare function importScripts(name: string): any;
declare var workbox: any;

importScripts("/wbsw.js");

const { strategies } = workbox;
const cacheKey = "dafabet-mobile-v1.5";

// const pages = [
//     "/",
//     "/en/",
// ];

self.addEventListener("install", (event: any) => {
    const context: any = self;

    context.skipWaiting();

    // event.waitUntil(
    //     caches.open(cacheKey)
    //         .then((cache) => {
    //             return cache.addAll(pages);
    //         }),
    // );
});

self.addEventListener("activate", (event: any) => {
    const context: any = self;

    // delete all cache keys on service worker activate (new service worker instance)
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    return caches.delete(key);
                }),
            );
        }),
    );

    return context.clients.claim();
});

// self.addEventListener("fetch", (event: any) => {
//     const networkFirst = strategies.networkFirst();
//     event.respondWith(networkFirst.makeRequest({request: event.request}));

//     event.respondWith(
//         caches.match(event.request)
//             .then((response) => {
//                 return response || fetch(event.request);
//             }),
//     );
// });

self.addEventListener("push", (event: any) => {
    // const context: any = self;

    // const payload = event.data.text();
    // const time = Date.now();

    // const promiseChain = context.registration.showNotification("Push Notification", {
    //     body: `Message: ${payload} on time ${time}`,
    //     data: {
    //         time,
    //     },
    // });

    // event.waitUntil(promiseChain);
});

// self.addEventListener("notificationclick", (event) => {
// });

if (workbox) {
    // Cache JS files
    workbox.routing.registerRoute(
        new RegExp(".*\.js"),
        workbox.strategies.networkFirst({
            cacheName: "js-cache",
        }),
    );

    // Cache CSS files
    workbox.routing.registerRoute(
        new RegExp("/.*\.css"),
        workbox.strategies.networkFirst({
            cacheName: "css-cache",
        }),
    );

    // Cache image files
    workbox.routing.registerRoute(
        new RegExp("/.*\.(?:png|jpg|jpeg|svg|gif|ico)"),
        workbox.strategies.networkFirst({
            cacheName: "image-cache",
            plugins: [
                new workbox.expiration.Plugin({
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
                }),
            ],
        }),
    );

    // Cache routes
    workbox.routing.registerRoute(
        new RegExp("/.*"),
        workbox.strategies.networkFirst({
            cacheName: "page-cache",
            plugins: [
                new workbox.expiration.Plugin({
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
                }),
            ],
        }),
    );
}
