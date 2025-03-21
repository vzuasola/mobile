import * as utility from "@core/assets/js/components/utility";
import * as xhr from "@core/assets/js/vendor/reqwest";

const VAPID_PUBLIC_KEY = "my-vapid-key";

Notification.requestPermission((status) => {
    console.log("Notification permission status", status);
});

utility.listen(document.body, "click", (event, src) => {
    if (utility.hasClass(src, "pwa-notify", true)) {

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
                // do nothing
            });
    }
});

utility.listen(document.body, "click", (event, src) => {
    if (utility.hasClass(src, "pwa-subscribe", true)) {

        navigator.serviceWorker.ready
            .then((serviceWorker) => {
                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                };

                return serviceWorker.pushManager.subscribe(subscribeOptions);
            })
            .then((subscription) => {

                const data: any = {
                    subscription: JSON.stringify(subscription),
                };

                xhr({
                    url: utility.url("/push"),
                    type: "json",
                    method: "post",
                    data,
                }).then((response) => {

                    if (typeof response.success !== "undefined" &&
                        response.success === true
                    ) {
                        // do nothing
                    }
                });
            })
            .catch((error) => {
                // do nothing
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
