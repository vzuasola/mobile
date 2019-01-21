const cacheKey = "dafabet-mobile-v1.0";

const pages = [
    "/app.css",
    "/app.js",
];

self.addEventListener("install", (event: any) => {
    const context: any = self;

    context.skipWaiting();

    event.waitUntil(
        caches.open(cacheKey)
            .then((cache) => {
                return cache.addAll(pages);
            }),
    );
});

self.addEventListener("activate", (event: any) => {

    const context: any = self;

    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== cacheKey) {
                        return caches.delete(key);
                    }
                }),
            );
        }),
    );

    return context.clients.claim();
});

self.addEventListener("fetch", (event: any) => {
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
