import "promise-polyfill/src/polyfill";

import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Modal} from "./components/modal";

import "./components";
import "./modules";
import "./loader";

Router.setOption(
    "main-components",
    ["header", "main", "menu", "footer", "language", "push_notification", "marketing", "seo", "announcement"],
);

// inital hashing of AJAX urls, we get the hashes from the cookies
Router.setOption("process-url-generators", (url: string, type: string) => {
    const hash = utility.getCookie("routerhash");

    if (hash) {
        const hashes = JSON.parse(hash);

        if (hashes) {
            for (const key in hashes) {
                if (hashes.hasOwnProperty(key)) {
                    const item = hashes[key];

                    if (item && key) {
                        url = utility.addQueryParam(url, key, item);
                    }
                }
            }
        }
    }

    return url;
});

ComponentManager.init();
Router.init();

Modal.listen(".modal-trigger");

// fix for Safari and Android not reloading the page on history back
window.onpageshow = (event) => {
    if (event.persisted) {
        window.location.reload();
    }
};
