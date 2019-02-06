declare var Notification: any;

import * as utility from "@core/assets/js/components/utility";

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();

    deferredPrompt = event;
});

utility.listen(document.body, "click", (event, src) => {
    if (utility.hasClass(src, "btn-add-to-home", true)) {
        if (deferredPrompt) {
            event.preventDefault();

            deferredPrompt.prompt();

            deferredPrompt.userChoice
                .then((choiceResult) => {
                    deferredPrompt = null;
                });
        }
    }
});
