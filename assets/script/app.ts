import "promise-polyfill/src/polyfill";
import "pwacompat";

import * as utility from "@core/assets/js/components/utility";

import {ComponentManager} from "@plugins/ComponentWidget/asset/component";
import {Router} from "@plugins/ComponentWidget/asset/router";

import {Modal} from "./components/modal";

import "./components";
import "./modules";
import "./loader";
import "./worker-registration";

// whenever the bootstrap AJAX receives a redirect, follow it
ComponentManager.setOption("module-response-handle-redirect", (request: XMLHttpRequest) => {
    window.location.href = request.responseURL;
});

// check if we are receiving the maintenance or resitricted page so we can
// redirect to it
ComponentManager.setOption("module-response-handle-error", (request: XMLHttpRequest) => {
    const page = request.getResponseHeader("x-page-error-type");

    if (page === "maintenance") {
        window.location.replace("/maintenance");
    } else if (page === "restricted") {
        window.location.replace("/restricted");
    }

    // handle additional error scenario here
});

Router.setOption(
    "main-components",
    ["header", "main", "menu", "footer", "language", "push_notification", "marketing", "seo", "announcement"],
);

ComponentManager.init();
Router.init();

Modal.listen(".modal-trigger");

// fix for Safari and Android not reloading the page on history back
window.onpageshow = (event) => {
    if (event.persisted) {
        window.location.reload();
    }
};
