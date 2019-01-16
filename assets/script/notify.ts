declare var Notification: any;

const VAPID_PUBLIC_KEY = "BBWEbHWHgQe4FZWBwbQHMVjV60K08f53ptySIGH17XR6peLhW1lbV_VrjS58inpztzJMiokYMlx57b05tngamDY";

import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

import {ComponentInterface, ComponentManager} from "@plugins/ComponentWidget/asset/component";

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();

    deferredPrompt = event;

    setTimeout(() => {
        ComponentManager.broadcast("pwa.show");
    }, 5 * 1000);
});

// Notification.requestPermission((status) => {
//     console.log("Notification permission status", status);
// });

utility.listen(document.body, "click", (event, src) => {
    if (utility.hasClass(src, "btn-add-to-home", true)) {
        if (deferredPrompt) {
            event.preventDefault();

            deferredPrompt.prompt();

            deferredPrompt.userChoice
                .then((choiceResult) => {
                    if (choiceResult.outcome === "accepted") {
                        console.log("User accepted the A2HS prompt");
                    } else {
                        console.log("User dismissed the A2HS prompt");
                    }

                    deferredPrompt = null;
                });
        }
    }
});

utility.listen(document.body, "click", (event, src) => {
    if (utility.hasClass(src, "pwa-notify", true)) {
        console.log("Attempting to display a notification");

        navigator.serviceWorker.ready
            .then((serviceWorker) => {
                if (Notification.permission === "granted") {
                    const time = Date.now();

                    serviceWorker.showNotification("Notification", {
                        body: `This is a notification ${time}`,
                        data: {
                            time,
                        },
                    });
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }
});

utility.listen(document.body, "click", (event, src) => {
    if (utility.hasClass(src, "pwa-subscribe", true)) {
        console.log("Attempting to do a subscription");

        navigator.serviceWorker.ready
            .then((serviceWorker) => {
                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                };

                return serviceWorker.pushManager.subscribe(subscribeOptions);
            })
            .then((subscription) => {
                console.log(subscription);

                const data: any = {
                    subscription: JSON.stringify(subscription),
                };

                xhr({
                    url: utility.url("/push"),
                    type: "json",
                    method: "post",
                    data,
                }).then((response) => {
                    console.log(response);

                    if (typeof response.success !== "undefined" &&
                        response.success === true
                    ) {
                        console.log("Subscription successful");
                    }
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }
});

/**
 *
 */
function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, "+")
        .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}
