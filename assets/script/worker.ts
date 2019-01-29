declare function importScripts(name: string): any;
declare var workbox: any;

importScripts("/wbsw.js");

const { strategies } = workbox;

if (workbox) {
    workbox.routing.registerRoute(
        new RegExp(".*\.js"),
        workbox.strategies.networkFirst({
            cacheName: "js-cache",
        }),
    );

    workbox.routing.registerRoute(
        // Cache CSS files
        new RegExp("/.*\.css"),
        // Use cache but update in the background ASAP
        workbox.strategies.networkFirst({
            // Use a custom cache name
            cacheName: "css-cache",
        }),
    );

    workbox.routing.registerRoute(
        // Cache image files
        new RegExp("/.*\.(?:png|jpg|jpeg|svg|gif)"),
        // Use the cache if it's available
        workbox.strategies.networkFirst({
            // Use a custom cache name
            cacheName: "image-cache",
            plugins: [
                new workbox.expiration.Plugin({
                    // Cache for a maximum of a week
                    maxAgeSeconds: 7 * 24 * 60 * 60,
                }),
            ],
        }),
    );

    workbox.routing.registerRoute(
        // Cache image files
        new RegExp("/.*"),
        // Use the cache if it's available
        workbox.strategies.networkFirst({
            // Use a custom cache name
            cacheName: "page-cache",
            plugins: [
                new workbox.expiration.Plugin({
                    // Cache for a maximum of a week
                    maxAgeSeconds: 7 * 24 * 60 * 60,
                }),
            ],
        }),
    );

    const cacheKey = "dafabet-mobile-v1.1";

    // const pages = [
    //     "/",
    //     "/en/",
    // ];

    // self.addEventListener("install", (event: any) => {
    //     const context: any = self;

    //     context.skipWaiting();

    //     event.waitUntil(
    //         caches.open(cacheKey)
    //             .then((cache) => {
    //                 return cache.addAll(pages);
    //             }),
    //     );
    // });

    self.addEventListener("activate", (event: any) => {

        // const context: any = self;

        // event.waitUntil(
        //     caches.keys().then((keyList) => {
        //         return Promise.all(
        //             keyList.map((key) => {
        //                 if (key !== cacheKey) {
        //                     return caches.delete(key);
        //                 }
        //             }),
        //         );
        //     }),
        // );

        // return context.clients.claim();
    });

    self.addEventListener("fetch", (event: any) => {

        // const networkFirst = strategies.networkFirst();
        // event.respondWith(networkFirst.makeRequest({request: event.request}));

        // event.respondWith(
        //     caches.match(event.request)
        //         .then((response) => {
        //             return response || fetch(event.request);
        //         }),
        // );
    });

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

    self.addEventListener("notificationclick", (event) => {
        // do nothing
    });

}
