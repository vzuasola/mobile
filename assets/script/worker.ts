import * as versioning from "@app/web/version.json";
import {Semver} from "./components/semver";

const version = versioning.version;
console.log("Service Worker version: " + Semver.show(version));

declare function importScripts(name: string): any;
declare var workbox: any;

importScripts("/wbsw.js");
workbox.setConfig({ debug: false });

const {strategies} = workbox;

self.addEventListener("install", (event: any) => {
    const context: any = self;

    context.skipWaiting();
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

    console.log("Doing a service worker activate event");

    return context.clients.claim();
});

if (workbox) {

    workbox.googleAnalytics.initialize();

    // Cache JS files
    workbox.routing.registerRoute(
        new RegExp(".*\.js"),
        workbox.strategies.networkFirst({
            cacheName: `cache.scripts.${version}`,
        }),
    );

    // Cache CSS files
    workbox.routing.registerRoute(
        new RegExp("/.*\.css"),
        workbox.strategies.networkFirst({
            cacheName: `cache.styles.${version}`,
        }),
    );

    // Cache image files
    workbox.routing.registerRoute(
        new RegExp("/.*\.(?:png|jpg|jpeg|svg|gif|ico)"),
        workbox.strategies.networkFirst({
            cacheName: `cache.images.${version}`,
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
            cacheName: `cache.page.${version}`,
            plugins: [
                new workbox.expiration.Plugin({
                    maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
                }),
            ],
        }),
    );
}

// self.addEventListener("push", (event: any) => {
//     const context: any = self;

//     const payload = event.data.text();
//     const time = Date.now();

//     const promiseChain = context.registration.showNotification("Push Notification", {
//         body: `Message: ${payload} on time ${time}`,
//         data: {
//             time,
//         },
//     });

//     event.waitUntil(promiseChain);
// });
